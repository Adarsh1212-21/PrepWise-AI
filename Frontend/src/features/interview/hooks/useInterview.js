import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf, deleteInterviewReport } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    setLoading(true)
    let response = null
    try {
        response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
        if (response?.interviewReport) {
            setReport(response.interviewReport)
        }
    } catch (error) {
        console.log(error)
    } finally {
        setLoading(false)
    }
    return response?.interviewReport || null
}

    const getReportById = async (interviewId) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            if (response?.interviewReport) {
                setReport(response.interviewReport)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
        return response?.interviewReport || null
    }

    const getReports = async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
        return response.interviewReports
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        try {
            await generateResumePdf({ interviewReportId })
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    // ✅ moved inside
    const deleteReport = async (interviewId) => {
        setLoading(true)
        try {
            await deleteInterviewReport(interviewId)
            setReports(prev => prev.filter(r => r._id !== interviewId))
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
            if (!report || report._id.toString() !== interviewId) {
                getReportById(interviewId)
            }
        } else {
            getReports()
        }
    }, [interviewId])

    // ✅ single return with deleteReport included
    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf, deleteReport }
}