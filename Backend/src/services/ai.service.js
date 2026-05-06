const Groq = require("groq-sdk")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
})
console.log("Groq API Key loaded:", !!process.env.GROQ_API_KEY)

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        Respond ONLY with a valid JSON object matching this exact schema:
                        ${JSON.stringify(zodToJsonSchema(interviewReportSchema), null, 2)}
                        
                        Do not include any explanation or markdown, just the raw JSON.`

    const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
    })

    return JSON.parse(response.choices[0].message.content)
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const prompt = `Create a professional ATS-friendly resume as HTML.

Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Return ONLY: { "html": "<resume html>" }

WRAPPER: <div style="width:100%;font-family:Arial,sans-serif;font-size:13px;color:#222;padding:0 28px;line-height:1.6;box-sizing:border-box;">

HEADER:
- <h1 style="text-align:center;font-size:24px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#1a3a5c;margin:0 0 4px;">NAME</h1>
- <p style="text-align:center;margin:2px 0;color:#444;">City | Phone</p>
- Centered links: <a href="mailto:email">email</a> | <a href="linkedin">LinkedIn</a> | <a href="github">GitHub</a> | <a href="portfolio">Portfolio</a> — use real values, NEVER the word "Email"
- <hr style="border:none;border-top:2px solid #1a3a5c;margin:10px 0;">

SECTION HEADINGS: <h2 style="font-size:13px;font-weight:bold;text-transform:uppercase;color:#1a3a5c;border-left:4px solid #2c5f8a;padding-left:8px;margin:16px 0 4px;">
AFTER EACH HEADING: <hr style="border:none;border-top:1px solid #d0d0d0;margin:4px 0 8px;">
EACH SECTION WRAPPED IN: <div style="page-break-inside:avoid;">

SKILLS: <p style="margin:3px 0;"><strong>Category:</strong> items</p> — Categories: Languages, Frontend, Backend, Databases, Tools & Tech

EXPERIENCE: flex row — <strong>Title | Company</strong> left, date right — 4 bullets with action verbs

PROJECTS: flex row — <strong>Name (Stack)</strong> left, <a href="#">GitHub | Live</a> right — 2 bullets each

EDUCATION: flex row — Degree + University left, date right — CGPA below

CERTIFICATIONS: <p style="margin:3px 0;">• <strong>Cert Name – Issuer</strong></p> — one line only, no descriptions

BULLETS: <p style="margin:2px 0 2px 12px;text-align:left;">• text</p>
PARAGRAPHS: text-align:justify
ALL TEXT: word-wrap:break-word`

    const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
    })

    const json = JSON.parse(response.choices[0].message.content)
    return json.html
}

module.exports = { generateInterviewReport, generateResumePdf }