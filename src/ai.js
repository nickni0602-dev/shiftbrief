import { cloudModel, firebaseConfig, recaptchaEnterpriseSiteKey } from "../firebase-config.js";

const sdkBase = "https://www.gstatic.com/firebasejs/13.4.0";

export const firebaseReady = Object.values(firebaseConfig).every(Boolean) && Boolean(recaptchaEnterpriseSiteKey);
export const inferenceSource = { onDevice: "on_device", cloud: "in_cloud" };
const languageModelOptions = {
  expectedInputs: [{ type: "text", languages: ["en"] }],
  expectedOutputs: [{ type: "text", languages: ["en"] }],
};

export const getDeviceAvailability = () => globalThis.LanguageModel?.availability(languageModelOptions) ?? Promise.resolve("unavailable");
const responseSchema = {
  type: "object",
  required: ["summary", "actions", "watch"],
  properties: {
    summary: { type: "string" },
    actions: {
      type: "array",
      items: {
        type: "object",
        required: ["task", "owner", "due"],
        properties: { task: { type: "string" }, owner: { type: "string" }, due: { type: "string" } },
      },
    },
    watch: { type: "array", items: { type: "string" } },
  },
};

const firebaseServices = firebaseReady ? Promise.all([
  import(`${sdkBase}/firebase-app.js`),
  import(`${sdkBase}/firebase-app-check.js`),
  import(`${sdkBase}/firebase-ai.js`),
]).then(([{ initializeApp }, { initializeAppCheck, ReCaptchaEnterpriseProvider }, sdk]) => {
  const app = initializeApp(firebaseConfig);
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(recaptchaEnterpriseSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
  return { sdk, ai: sdk.getAI(app, { backend: new sdk.GoogleAIBackend() }) };
}).catch(() => null) : null;

const models = new Map();

export async function getShiftModel(mode) {
  if (!firebaseReady) throw new Error("Firebase AI Logic and App Check need to be configured. Load the example to preview the workspace.");
  const services = await firebaseServices;
  if (!services) throw new Error("Could not initialize the Firebase SDK.");
  const { ai, sdk: { getGenerativeModel, InferenceMode } } = services;
  if (!models.has(mode)) {
    models.set(mode, getGenerativeModel(ai, {
      mode: mode === "local" ? InferenceMode.ONLY_ON_DEVICE : InferenceMode.PREFER_ON_DEVICE,
      inCloudParams: {
        model: cloudModel,
        generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
      },
      onDeviceParams: { createOptions: languageModelOptions, promptOptions: { responseConstraint: responseSchema } },
    }));
  }
  return models.get(mode);
}
