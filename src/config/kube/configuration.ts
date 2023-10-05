import { registerAs } from "@nestjs/config";
import * as process from "process";

export default registerAs("kube", () => ({
  kubeconfig: process.env.KUBE_KUBECONFIG,
  namespace: process.env.KUBE_NAMESPACE,
  apiUrl: process.env.KUBE_API_URL,
  proxyServiceName: process.env.KUBE_PROXY_SERVICE_NAME,
}));
