# #BuildHybridAI 2026 submission draft

**Project name** ShiftBrief  
**Category** Web / Chrome  
**Tagline** Turn rough shift notes into a handoff brief while controlling where the notes are processed.

## What it does

ShiftBrief helps an incoming shift find the tasks and thresholds that need attention. Paste the outgoing team's notes and get a short summary, a follow-up list with owners and deadlines where available, and a separate list of watch items. Review the handoff against the original notes, then copy it as Markdown for the team's existing channels.

## How Firebase AI Logic is used

The web app initializes Firebase App Check and calls Firebase AI Logic's JavaScript SDK at runtime. It uses the SDK's hybrid model API and Chrome's Gemini Nano path. The default `ONLY_ON_DEVICE` mode keeps the prompt on the device. The optional `PREFER_ON_DEVICE` mode lets the SDK run cloud inference if the local path is unavailable. The application shows the inference source reported by the SDK. The model returns structured JSON, which the client validates before displaying the result. Unassigned tasks and missing deadlines stay visible.

## What was built during the contest

The note editor, handoff display, sample data, mode control, Firebase AI Logic integration, and Markdown export were developed for this entry. Codex assisted with implementation, tests, and this draft. The sample warehouse notes are fictional.

## Submission fields to complete after live verification

- Public GitHub or GitLab repository URL with source code, setup instructions, and Apache-2.0 license.
- Public YouTube URL for the English demo, under three minutes. Replace the preview output with footage of live inference before publication.
- Hosted HTTPS app URL plus any testing instructions needed by the judges. Keep the demo working until the judging period ends.
- Verify the entrant's contribution, eligibility and ownership statements before submitting.

## Demo script · approximately 1 minute 30 seconds

1. **0:00–0:15** “An incoming shift needs to know what to do next. Important details are easy to miss in a handoff full of free-form notes.” Show the fictional warehouse example.
2. **0:15–0:45** Select **This device only**, click **Generate handoff**, and show the actual result and `On-device inference` badge. “The brief keeps the ticket number and temperature threshold. Marta and Leon get their named follow-ups, and the badge reader stays unassigned.” Adjust those words to reflect the actual output.
3. **0:45–1:15** On a second browser or machine without the local model, select **This device with cloud fallback** and run the same example. Show the actual `Cloud inference` result. “This mode is opt-in. Firebase AI Logic falls back to the cloud here because the local model isn't available.”
4. **1:15–1:30** Click **Copy brief** and paste into a plain-text editor. “The team can share a reviewed handoff in the channel it already uses.”
