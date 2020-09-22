# Configuration Format

Each gamepad contains has to have the following properties:

```javascript
{
    "id": Number, // between 0 and 65565
    "feeder": String, // name of the feeder. currently either "vigem" (XInput), "vjoy" (DirectInput) or "dummy" (for debugging to terminal)
    "options": Object, // optional object of additional feeder specific options
}
```