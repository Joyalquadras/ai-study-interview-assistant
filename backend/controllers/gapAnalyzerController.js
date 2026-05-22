// backend/controllers/gapAnalyzerController.js
import GapAnalysis from '../models/GapAnalysis.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import { generateContent } from '../services/geminiService.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const analyzeGap = asyncHandler(async (req, res) => {
  const { jobDescription, resumeId } = req.body;

  if (!jobDescription || !jobDescription.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Job description is required',
    });
  }

  let skills = 'not provided';

  if (resumeId) {
    const resume = await ResumeAnalysis.findById(resumeId);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume analysis not found',
      });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to use this resume analysis',
      });
    }

    const skillSet = [
      ...(resume.detectedSkills || []),
      ...(resume.skills?.technical || []),
      ...(resume.skills?.soft || []),
    ];
    skills = [...new Set(skillSet)].join(', ') || 'not provided';
  }

  const prompt = `Compare this job description with the candidate skills.
Job Description: ${jobDescription}
Candidate Skills: ${skills}
Return ONLY JSON:
{
  "matchScore": 72,
  "matchedSkills": ["skill1"],
  "missingSkills": ["skill2"],
  "priorityTopics": ["topic1","topic2","topic3"],
  "recommendation": "short paragraph"
}`;

  const parsed = await generateContent(prompt, true);

  const analysis = await GapAnalysis.create({
    userId: req.user._id,
    jobDescription: jobDescription.trim(),
    matchScore: parsed.matchScore,
    matchedSkills: parsed.matchedSkills || [],
    missingSkills: parsed.missingSkills || [],
    priorityTopics: parsed.priorityTopics || [],
    recommendation: parsed.recommendation || '',
  });

  res.status(201).json({
    success: true,
    data: analysis,
  });
});

export const getHistory = asyncHandler(async (req, res) => {
  const history = await GapAnalysis.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    data: history,
  });
});
