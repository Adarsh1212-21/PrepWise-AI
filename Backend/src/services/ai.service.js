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
    const prompt = `Generate a professional, ATS-friendly resume as HTML for this candidate.
                    Resume: ${resume}
                    Self Description: ${selfDescription}
                    Job Description: ${jobDescription}

                    Return ONLY a JSON object: { "html": "<resume html here>" }
                    No markdown, no explanation, just raw JSON.

                      STRICT LAYOUT RULES:
                    - Outer wrapper: <div style="width:100%;font-family:Arial,sans-serif;font-size:13px;color:#222;box-sizing:border-box;line-height:1.6;padding:0 28px;">
                    - All paragraph text must have: text-align:justify;
                    - NO fixed pixel widths, NO overflow:hidden, NO tables, NO floats, NO position:absolute
                    - All text must have word-wrap:break-word;overflow-wrap:break-word
                    - For side-by-side content use display:flex;justify-content:space-between;width:100%;align-items:baseline;
                    - Bullet points: <p style="margin:2px 0 2px 12px;text-align:left;">• text</p> NOT <ul><li>

                     HEADER SECTION (top of resume):
                    - Name: <h1 style="text-align:center;font-size:24px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#1a3a5c;margin:0 0 4px;">NAME</h1>
                    - Location + phone on one centered line: <p style="text-align:center;margin:2px 0;color:#444;">City, State | +91 XXXXXXXXXX</p>
                    - Contact links — use the ACTUAL values from the resume (real email address, real LinkedIn URL label, real GitHub URL label):
                      <div style="display:flex;justify-content:center;gap:0;margin:4px 0;">
                        <a href="mailto:actual@email.com" style="color:#2c5f8a;text-decoration:none;">actual@email.com</a>
                        <span style="margin:0 8px;color:#999;">|</span>
                        <a href="https://linkedin.com/in/username" style="color:#2c5f8a;text-decoration:none;">LinkedIn</a>
                        <span style="margin:0 8px;color:#999;">|</span>
                        <a href="https://github.com/username" style="color:#2c5f8a;text-decoration:none;">GitHub</a>
                        <span style="margin:0 8px;color:#999;">|</span>
                        <a href="https://portfolio-url.com" style="color:#2c5f8a;text-decoration:none;">Portfolio</a>
                      </div>
                    - NEVER write the word "Email" — always use the actual email address as the link text
                    - Horizontal rule after header: <hr style="border:none;border-top:2px solid #1a3a5c;margin:10px 0;">

                    SECTION HEADINGS:
                    - <h2 style="font-size:13px;font-weight:bold;text-transform:uppercase;color:#1a3a5c;border-left:4px solid #2c5f8a;padding-left:8px;margin:16px 0 6px;">SECTION NAME</h2>
                    - Always add <hr style="border:none;border-top:1px solid #d0d0d0;margin:4px 0 8px;"> immediately after each section heading

                    PROFESSIONAL SUMMARY:
                    - 3-4 sentence paragraph tailored to the job description
                    - <p style="margin:0 0 4px;line-height:1.7;">...</p>

                    TECHNICAL SKILLS:
                    - Show as labeled rows, each label bolded: <p style="margin:3px 0;"><strong>Languages:</strong> JavaScript, Java, HTML5...</p>
                    - Categories: Languages, Frontend, Backend, Databases, Tools & Tech

                    PROFESSIONAL EXPERIENCE:
                    - Each role: flex row with <strong>Job Title | Company</strong> on left, <span>Month Year – Month Year</span> on right
                    - 4-6 bullet points per role, starting with strong action verbs, quantify achievements where possible

                    KEY PROJECTS (very important - must include this section):
                    - Each project: flex row with <strong>Project Name (Tech Stack)</strong> on left, <a href="#">GitHub | Live</a> on right
                    - 2-3 bullet points per project describing what was built and impact

                    EDUCATION:
                    - Flex row: Degree + University on left, Date range on right
                    - CGPA on next line

                     CERTIFICATIONS:
                    - Each cert as a simple line, NO descriptions, NO explanations after the dash:
                      <p style="margin:3px 0;">• <strong>Certification Name – Issuer</strong></p>
                    - Example: <p style="margin:3px 0;">• <strong>Oracle Cloud Infrastructure 2025 – Certified AI Foundations Associate</strong></p>
                    - Keep it to one line per cert, name and issuer only

                    CONTENT RULES:
                    - Tailor everything to the job description
                    - Do NOT sound AI-generated
                    - Include ALL sections: Summary, Skills, Experience, Projects, Education, Certifications`

    const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
    })

    const json = JSON.parse(response.choices[0].message.content)
    return json.html
}

module.exports = { generateInterviewReport, generateResumePdf }