# OSRTIME Syncbox TCR — Changelog

This changelog documents the changes, fixes, and improvements made to OSRTIME Syncbox TCR during development and beta testing.

Our goal is to keep these notes understandable even if you are not familiar with the technical details behind Android audio, timecode, or synchronization.

---

## 1.0.1 — Audio Routing & 24-Bit Stability Update

### What changed?

This update focuses primarily on **external audio devices, USB audio routing, and 24-bit recording stability**.

During beta testing, we discovered that Android audio devices can report 24-bit support in different ways. A device may appear to support 24-bit audio while Android is not necessarily able to open that particular format through the same recording path.

Previously, attempting to switch to 24-bit in such a situation could leave the audio system in an unstable state or cause the audio path to stop responding.

### What we fixed

OSRTIME Syncbox TCR now handles these situations much more safely.

- Improved detection and handling of external USB audio devices.
- Improved switching between built-in, wired, and USB audio inputs.
- Improved handling of 16-bit and 24-bit audio capabilities.
- Added support for 24-bit recording on compatible USB audio devices.
- Devices that cannot currently start the requested 24-bit format can safely fall back to 16-bit instead.
- Fixed an issue where attempting to use an unsupported 24-bit configuration could leave the audio system unresponsive.
- Improved stability when connecting, disconnecting, and manually selecting external audio devices.

### About the 16-bit fallback

If you select **24-bit** and OSRTIME Syncbox TCR reports that it has fallen back to **16-bit**, this does not necessarily indicate a malfunction.

Our beta testing revealed that different USB audio devices expose 24-bit audio to Android differently. Support therefore currently depends on both the connected hardware and the audio format Android makes available to the app.

Rather than forcing an incompatible configuration, OSRTIME Syncbox TCR now falls back safely to a working format.

We are continuing to expand compatibility with additional 24-bit USB audio implementations.

### Tested during this development cycle

Testing included several different input configurations, including:

- Built-in Android microphone
- Wired 3.5 mm microphone input
- USB-C to 3.5 mm audio adapters
- DJI Mic 3
- Creative Sound Blaster Play
- Behringer UMC204HD
- Zoom UAC-232

The purpose of testing different devices is not only to support individual products, but to make the audio system more robust across the wide variety of USB audio hardware available for Android.

### Beta testing continues

OSRTIME Syncbox TCR is still being actively tested.

If you encounter unexpected behaviour, a device that does not work correctly, or a workflow that could be improved, please let us know.

Real-world testing across different Android devices and audio hardware directly helps us improve compatibility and stability before release.

---

Thank you to everyone participating in the OSRTIME Syncbox TCR beta and contributing feedback, hardware tests, and bug reports.
