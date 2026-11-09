# Brick Weapon Vision Function

This Supabase Edge Function keeps the OpenAI API key off the public website. It accepts a brick-weapon image, requests structured vision analysis, normalizes the returned quantities, and sends a build-manual payload back to the Chinese or English page.

## Deploy

1. Link the repository to the production Supabase project.
2. Add the server-only secret:

   ```sh
   supabase secrets set OPENAI_API_KEY=your_server_key
   ```

3. Optional configuration:

   ```sh
   supabase secrets set OPENAI_VISION_MODEL=gpt-5.6-luna
   supabase secrets set ALLOWED_ORIGINS=https://old-nine86.github.io
   ```

4. Deploy the function:

   ```sh
   supabase functions deploy analyze-brick-weapon
   ```

5. Set `manualVisionFunction: "analyze-brick-weapon"` in `supabase-config.js`.

Leave `manualVisionFunction` empty until deployment is verified. Both public pages will continue using local Canvas analysis whenever the function is disabled, times out, or returns an invalid result.

## Request

```json
{
  "image_url": "data:image/jpeg;base64,...",
  "locale": "zh",
  "weapon_hint": {
    "name": "Example Weapon",
    "type": "sword"
  },
  "local_estimate": {
    "estimated": 120
  }
}
```

The function uses the OpenAI Responses API with image input and a strict JSON schema. Do not place `OPENAI_API_KEY` in `supabase-config.js` or any browser storage.
