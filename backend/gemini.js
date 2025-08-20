import axios from "axios"

const geminiResponse = async (command, assistantName, userName) => {
    try {
        const apiUrl = process.env.GEMINI_API_URL

        // ----------------- EXTRA PRE-PROCESSING LAYER -----------------
        let processedCommand = command
        let platform = null
        let detectedType = null

        // Detect any Netflix/Hotstar play command & extract only the movie/show name
        const playPatterns = [
            { regex: /\bplay\s+(.+?)\s*(?:movie|show)?\s*on\s*netflix\b/i, type: "Netflix-play", platform: "Netflix" },
            { regex: /\bplay\s+(.+?)\s*(?:movie|show)?\s*on\s*hotstar\b/i, type: "Hotstar-play", platform: "Hotstar" }
        ]

        for (let { regex, type, platform: p } of playPatterns) {
            const match = command.match(regex)
            if (match) {
                processedCommand = match[1].trim()
                platform = p
                detectedType = type
                break
            }
        }

        // General pronunciation/spelling corrections for common words/platforms
        const corrections = {
            "netflicks": "netflix",
            "net flix": "netflix",
            "hot star": "hotstar",
            "hot starr": "hotstar"
        }
        Object.keys(corrections).forEach(wrong => {
            const regex = new RegExp(`\\b${wrong}\\b`, "i")
            if (regex.test(processedCommand)) {
                processedCommand = processedCommand.replace(regex, corrections[wrong])
            }
        })
        // ----------------- END EXTRA LAYER -----------------

        const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}. 
You are not Google. You will now behave like a voice-enabled assistant.

Your task is to understand the user's natural language input and respond with a JSON object like this:

{
  "type": "general" | "google-search" | "youtube-search" | "youtube-open" | "youtube-play" | "get-time" | "get-date" | "get-day" | "get-month" | "calculator-open" | "instagram-open" | "facebook-open" | "weather-show" | "watsapp-open" | "cricbuzz-open" | "Netflix-open" | "Netflix-play" | "Hotstar-open" | "Hotstar-play" | "Hotstar-search",
  "userInput": "<original or processed command>" {only remove your name from userinput if exists and if it is a Netflix/Hotstar play request then only send the movie/show name without play/on Netflix/etc.},
  "response": "<a short spoken response to read out loud to the user>"
}

Instructions:
- If it's a Netflix/Hotstar play command, "userInput" must contain only the clean movie/show name.
- If pronunciation/spelling errors are present, correct them using your own knowledge of popular titles on that platform.
- For all other commands, send the cleaned original user request.
- "type": detect intent correctly based on the cleaned command.
- "response": short and voice-friendly.

Type meanings:
- "general": if it's a factual or informational question. aur agar koi aisa question puchta hai jiska answer tume pata hai usko bhi general ki category me rakho bas short answer dena
- "google-search": if user wants to search something on Google .
- "youtube-search": if user wants to search something on YouTube.
- "youtube-play": if user wants to directly play a video or song.
- "calculator-open": if user wants to  open a calculator .
- "instagram-open": if user wants to  open instagram .
- "youtube-open": if user wants to  open youtube .
- "facebook-open": if user wants to open facebook.
- "weather-show": if user wants to know weather
- "get-time": if user asks for current time.
- "get-date": if user asks for today's date.
- "get-day": if user asks what day it is.
- "get-month": if user asks for the current month.
- "watsapp-open": if user wants to open whatsapp.
- "cricbuzz-open": if user wants to open cricbuzz.
- "Netflix-open": if user wants to open netflix.
- "Netflix-play": if user wants to play something on netflix.


Important:
- Use ${userName} agar koi puche tume kisne banaya 
- Only respond with the JSON object, nothing else.

now your userInput- ${processedCommand}
`

        const result = await axios.post(apiUrl, {
            "contents": [{
                "parts": [{ "text": prompt }]
            }]
        })

        let aiResponse = result.data.candidates[0].content.parts[0].text

        // If we detected Netflix/Hotstar play type locally, ensure JSON reflects that
        if (detectedType && aiResponse.includes('"type": "general"')) {
            aiResponse = aiResponse.replace('"type": "general"', `"type": "${detectedType}"`)
        }

        return aiResponse
    } catch (error) {
        console.log(error)
    }
}

export default geminiResponse
