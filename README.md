# ShiftBrief

ShiftBrief turns rough shift notes into a summary, follow-up tasks, and watch items. It shows missing owners and deadlines and copies the reviewed brief as Markdown. Its default uses Firebase AI Logic in `ONLY_ON_DEVICE` mode. An explicit opt-in changes the mode to `PREFER_ON_DEVICE`, which allows the Firebase SDK to fall back to cloud Gemini. The brief labels the inference source returned by the SDK.

## Run locally

```sh
npm test
npm run dev
```

Open `http://127.0.0.1:4177` and choose **Load example** to preview the UI with fictional warehouse notes. Without Firebase configuration, this loads a labeled sample response. With configuration, it loads only the notes, and **Generate handoff** runs the model. The project has no npm runtime dependencies. It loads the pinned official Firebase JavaScript browser SDK from Google's CDN when connected to a configured project.

## Enable inference

1. Create a Google Firebase project and register a Web app. Enable Firebase AI Logic with the Gemini Developer API and register the Web app in Firebase App Check with reCAPTCHA Enterprise. Add your HTTPS deployment hostname to the reCAPTCHA key's allowed domains. [Firebase AI Logic setup](https://firebase.google.com/docs/ai-logic/get-started) · [App Check setup](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider)
2. Fill in the Firebase Web app configuration and reCAPTCHA Enterprise site key in `firebase-config.js`. Use the Web app's `apiKey` from the Firebase project settings. The Gemini Developer API key created by Firebase remains in the Firebase backend. Keep service credentials and App Check debug tokens out of the repository and demo.
3. Host `index.html`, `firebase-config.js`, `src/`, and `vendor/` together at the configured HTTPS origin. For local cloud testing with `npm run dev`, follow the App Check debug provider workflow on a local copy. Use a current desktop Google Chrome with the Prompt API and Gemini Nano 4 available. Enable `Gemma 4 for Built-in AI` at `chrome://flags` if needed and relaunch Chrome. Click **Prepare device model** if the button appears. [App Check debug provider](https://firebase.google.com/docs/app-check/web/debug-provider) · [Contest FAQ](https://firebasehybridaihackathon.devpost.com/details/faqs)
4. Load the example and generate once in device-only mode. Record the `On-device inference` badge. On an environment where Chrome Prompt API is unavailable, select cloud fallback and generate with the same example. Record `Cloud inference`. This second route depends on Firebase model availability and App Check for the hosted origin.

The app keeps the notes in the current page. Selecting cloud fallback allows the notes to leave the device when local inference is unavailable. Review the model's proposed actions against the source before sharing.

[Contest rules](https://firebasehybridaihackathon.devpost.com/rules) · [Firebase hybrid Web SDK](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started)
