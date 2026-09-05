# Deploying Eveno to Kubernetes

Plain manifests, applied in order. No Helm or Kustomize — there is one
environment's worth of configuration here, and a templating layer would be
more machinery than it saves.

```
00-namespace-config.yaml   Namespace, ConfigMap, Secret template
10-mongo.yaml              Single-node MongoDB (StatefulSet + headless Service)
20-backend.yaml            API Deployment, Service, PodDisruptionBudget
30-frontend.yaml           Web Deployment, Service, PodDisruptionBudget
40-ingress.yaml            TLS + host routing for both
50-seed-job.yaml           Optional: load demo data
```

## Three values that must agree

Most broken deployments of this app come down to one mismatch. The browser
talks to the API *directly*, so:

| Value | Set in | Must equal |
|---|---|---|
| `NEXT_PUBLIC_API_BASE` | frontend image **build arg** | the public API URL |
| API host | `40-ingress.yaml` | the same public API URL |
| `CORS_ORIGIN` | `eveno-config` ConfigMap | the public **app** URL |

If `NEXT_PUBLIC_API_BASE` is wrong, the site loads and every request fails.
If `CORS_ORIGIN` is wrong, the same thing happens with a CORS error instead.

`NEXT_PUBLIC_*` variables are compiled into the JavaScript the browser
downloads. Putting them in the Deployment's `env:` does nothing — you have to
rebuild the image to change them.

## Local cluster (Docker Desktop / kind / minikube)

Verified end to end on Docker Desktop's built-in Kubernetes. Two things differ
from the production path: there is no ingress controller, and the hostnames in
the ConfigMap point at a domain you don't own.

```bash
# Enable Kubernetes: Docker Desktop → Settings → Kubernetes → Enable, or
#   docker desktop enable kubernetes
kubectl config use-context docker-desktop

# Build images with the URLs the BROWSER will use — here, the port-forwards below.
docker build -t eveno-backend:latest ./backend
docker build -t eveno-frontend:latest \
  --build-arg NEXT_PUBLIC_API_BASE=http://localhost:8080 \
  --build-arg NEXT_PUBLIC_DESCOPE_PROJECT_ID=<project-id> \
  ./frontend
```

Docker Desktop's Kubernetes shares the local image store, so `imagePullPolicy:
IfNotPresent` finds these without a registry. On kind or minikube you need
`kind load docker-image eveno-backend:latest` or `minikube image load ...`
first, or the pods sit in `ErrImagePull`.

```bash
kubectl apply -f k8s/00-namespace-config.yaml

# CORS_ORIGIN ships pointing at eveno.example.com. Locally it has to match the
# port-forwarded frontend, or every API call fails preflight.
kubectl -n eveno create configmap eveno-config \
  --from-literal=PORT=8080 \
  --from-literal=CORS_ORIGIN=http://localhost:3000 \
  --dry-run=client -o yaml | kubectl apply -f -

# Replace the placeholder Secret with real values.
kubectl -n eveno create secret generic eveno-secrets \
  --from-literal=MONGO_URI='mongodb://eveno-mongo-0.eveno-mongo.eveno.svc.cluster.local:27017/eveno' \
  --from-literal=DESCOPE_PROJECT_ID='...' \
  --from-literal=RAZORPAY_KEY_ID='...' \
  --from-literal=RAZORPAY_KEY_SECRET='...' \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl apply -f k8s/10-mongo.yaml
kubectl -n eveno rollout status statefulset/eveno-mongo

kubectl apply -f k8s/20-backend.yaml -f k8s/30-frontend.yaml
kubectl -n eveno rollout status deployment/eveno-backend

# Skip 40-ingress.yaml locally — it needs an ingress-nginx controller and real
# DNS. Port-forward instead (each in its own terminal):
kubectl -n eveno port-forward svc/eveno-frontend 3000:3000
kubectl -n eveno port-forward svc/eveno-backend 8080:8080

# Optional demo data
kubectl apply -f k8s/50-seed-job.yaml && kubectl -n eveno logs -f job/eveno-seed
```

Then open http://localhost:3000.

One caveat when testing: `kubectl port-forward` attaches to a single pod, so it
drops when that pod is replaced. Connection failures during a `rollout restart`
are the forward dying, not downtime — check from inside the cluster
(`kubectl -n eveno run probe --rm -it --image=curlimages/curl -- sh`) if you
want to measure availability honestly.

Tear it all down with `kubectl delete namespace eveno`.

## Deploy to a real cluster

```bash
# 1. Build and push. Note the build args on the frontend.
docker build -t <registry>/eveno-backend:v1 ./backend
docker build -t <registry>/eveno-frontend:v1 \
  --build-arg NEXT_PUBLIC_API_BASE=https://api.eveno.example.com \
  --build-arg NEXT_PUBLIC_DESCOPE_PROJECT_ID=<project-id> \
  ./frontend
docker push <registry>/eveno-backend:v1
docker push <registry>/eveno-frontend:v1
```

Then point the manifests at those images — replace `eveno-backend:latest` and
`eveno-frontend:latest` in `20-backend.yaml`, `30-frontend.yaml` and
`50-seed-job.yaml`. Prefer a real version tag over `latest`: with `latest`,
`kubectl rollout restart` may or may not pick up your new build depending on
the pull policy, which makes deploys unpredictable.

```bash
# 2. Namespace and config. Create the Secret out of band rather than
#    committing real credentials:
kubectl apply -f k8s/00-namespace-config.yaml     # namespace + configmap
kubectl -n eveno create secret generic eveno-secrets \
  --from-literal=MONGO_URI='mongodb://eveno-mongo-0.eveno-mongo.eveno.svc.cluster.local:27017/eveno' \
  --from-literal=DESCOPE_PROJECT_ID='...' \
  --from-literal=RAZORPAY_KEY_ID='...' \
  --from-literal=RAZORPAY_KEY_SECRET='...' \
  --dry-run=client -o yaml | kubectl apply -f -

# 3. Database, then the apps.
kubectl apply -f k8s/10-mongo.yaml
kubectl -n eveno rollout status statefulset/eveno-mongo
kubectl apply -f k8s/20-backend.yaml -f k8s/30-frontend.yaml
kubectl apply -f k8s/40-ingress.yaml

kubectl -n eveno rollout status deployment/eveno-backend
```

## Afterwards

```bash
# Grant yourself admin (there is no UI path to this role, by design)
kubectl -n eveno exec deploy/eveno-backend -- node dist/scripts/makeAdmin.js you@example.com

# Load demo data (optional)
kubectl apply -f k8s/50-seed-job.yaml
kubectl -n eveno logs job/eveno-seed
```

## What the probes mean

`/healthz` answers as long as the process is alive and never touches Mongo, so
a database outage doesn't make Kubernetes kill every API pod. `/readyz`
reports the Mongo connection state, so pods drop out of the Service while the
database is unreachable and rejoin on their own when it returns.

The API handles `SIGTERM` by closing the listener and letting in-flight
requests drain (10s cap), which is why rolling updates don't cut off a payment
mid-verification.

## Known limitations at more than one replica

Both of these are correct but degraded, and both are single-line comments in
the code today:

- **The payment rate limit is per-pod.** `src/middleware/rateLimit.ts` keeps
  counters in process memory, so 2 replicas means the effective limit is 40
  requests per user per 15 minutes, not 20. Move the counter to Redis if the
  limit needs to be real.
- **The stale-seat sweeper runs in every pod.** `src/jobs/releaseStaleSeats.ts`
  reclaims each seat with an atomic update, so concurrent sweeps can't
  double-credit — it is just duplicated work. Move it to a `CronJob` if that
  becomes wasteful.

## MongoDB

`10-mongo.yaml` is a single pod with a PersistentVolumeClaim. That is fine for
a demo or a staging cluster and **not** fine for production: one replica means
downtime during any node drain, and nothing here takes backups. For anything
real, delete that file and point `MONGO_URI` at a managed database. The app
uses no multi-document transactions, so it does not need a replica set.
