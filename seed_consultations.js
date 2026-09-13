import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "./src/db/index.js";
import { Consultation } from "./src/models/consultation.model.js";
import { User } from "./src/models/user.model.js";
import { Response } from "./src/models/response.model.js";

async function seedData() {
  await connectDB();

  const admin = await User.findOne({ email: "admin@civis.vote" });
  if (!admin) {
    console.error("Admin user not found. Please ensure admin@civis.vote exists.");
    process.exit(1);
  }

  const consultationsToSeed = [
    {
      title: "National Clean Air & Low-Emission Urban Zones Policy 2026",
      category: "Environment & Climate",
      description:
        "Draft framework for designating Zero and Low-Emission Zones in metropolitan cities, phasing out older diesel freight vehicles, and funding municipal electric bus fleets with dedicated cycling corridors.",
      status: "open",
      createdBy: admin._id,
      questions: [
        {
          questionId: "q1",
          text: "How strongly do you support establishing Low-Emission Zones (LEZs) restricting high-polluting vehicles in city centers?",
          type: "single_choice",
          options: ["Strongly Support", "Support", "Neutral", "Oppose", "Strongly Oppose"],
          required: true,
        },
        {
          questionId: "q2",
          text: "Which municipal environmental interventions should be funded as top priorities?",
          type: "multi_choice",
          options: [
            "Expanding 100% electric municipal bus fleets",
            "Creating continuous protected cycling lanes and pedestrian walkways",
            "Subsidies for small business EV commercial delivery vehicles",
            "Real-time neighborhood air quality monitoring stations",
            "Planting dense urban forests in high-pollution corridors",
          ],
          required: true,
        },
        {
          questionId: "q3",
          text: "How would you rate the current air quality and smog management in your residential area?",
          type: "single_choice",
          options: ["Good", "Moderate", "Unhealthy", "Hazardous"],
          required: true,
        },
        {
          questionId: "q4",
          text: "What concerns or suggestions do you have regarding the economic impact on small commercial drivers and delivery workers?",
          type: "text",
          required: false,
        },
      ],
      mockResponses: [
        {
          answers: [
            { questionId: "q1", value: "Strongly Support" },
            {
              questionId: "q2",
              value: [
                "Expanding 100% electric municipal bus fleets",
                "Creating continuous protected cycling lanes and pedestrian walkways",
              ],
            },
            { questionId: "q3", value: "Unhealthy" },
            {
              questionId: "q4",
              value:
                "Air pollution during winter is unbearable. We need strict zones, but provide EV conversion subsidies for auto-rickshaws so drivers do not lose livelihood.",
            },
          ],
        },
        {
          answers: [
            { questionId: "q1", value: "Support" },
            {
              questionId: "q2",
              value: [
                "Real-time neighborhood air quality monitoring stations",
                "Planting dense urban forests in high-pollution corridors",
              ],
            },
            { questionId: "q3", value: "Moderate" },
            {
              questionId: "q4",
              value:
                "Monitoring stations are essential to hold municipal wards accountable. Focus on industrial emissions alongside traffic.",
            },
          ],
        },
        {
          answers: [
            { questionId: "q1", value: "Oppose" },
            {
              questionId: "q2",
              value: ["Subsidies for small business EV commercial delivery vehicles"],
            },
            { questionId: "q3", value: "Moderate" },
            {
              questionId: "q4",
              value:
                "Entry taxes on delivery vans will raise grocery prices for families. Give drivers at least 3 years transition grace period.",
            },
          ],
        },
      ],
    },
    {
      title: "Digital Personal Data Protection & AI Ethics in Governance Framework 2026",
      category: "Digital Governance & Technology",
      description:
        "Comprehensive national guidelines establishing citizen data sovereignty, mandatory algorithmic audits for government AI services, and strict grievance redressal mechanisms for digital identity systems.",
      status: "open",
      createdBy: admin._id,
      questions: [
        {
          questionId: "q1",
          text: "How confident are you in the current privacy protections for citizen data across government web portals?",
          type: "single_choice",
          options: ["Very Confident", "Somewhat Confident", "Neutral", "Not Confident", "Extremely Concerned"],
          required: true,
        },
        {
          questionId: "q2",
          text: "Which AI governance requirements should be legally binding on all public sector automated systems?",
          type: "multi_choice",
          options: [
            "Mandatory independent bias audits before welfare deployment",
            "Right to human review for automated benefits rejection",
            "Open-source transparency for algorithms affecting citizens",
            "Strict penalties for unauthorized biometric data access",
          ],
          required: true,
        },
        {
          questionId: "q3",
          text: "What measures should be enacted to safeguard senior citizens and digitally non-literate individuals from algorithmic exclusion?",
          type: "text",
          required: true,
        },
      ],
      mockResponses: [
        {
          answers: [
            { questionId: "q1", value: "Not Confident" },
            {
              questionId: "q2",
              value: [
                "Right to human review for automated benefits rejection",
                "Mandatory independent bias audits before welfare deployment",
              ],
            },
            {
              questionId: "q3",
              value:
                "No citizen should be denied pensions because biometric fingerprint scanners failed. Physical human desks must always remain an option.",
            },
          ],
        },
        {
          answers: [
            { questionId: "q1", value: "Somewhat Confident" },
            {
              questionId: "q2",
              value: [
                "Strict penalties for unauthorized biometric data access",
                "Open-source transparency for algorithms affecting citizens",
              ],
            },
            {
              questionId: "q3",
              value:
                "Create localized customer support kiosks in rural post offices with biometric alternatives.",
            },
          ],
        },
      ],
    },
    {
      title: "Universal Telemedicine Access & Community Health Centers Bill 2026",
      category: "Healthcare & Public Welfare",
      description:
        "Proposal to integrate accredited video telemedicine into primary health centers, establish subsidized generic medicine dispensaries, and dispatch mobile diagnostic vans to remote wards.",
      status: "open",
      createdBy: admin._id,
      questions: [
        {
          questionId: "q1",
          text: "How would you rate the availability of specialist medical consultations in your neighborhood clinic?",
          type: "single_choice",
          options: ["Excellent", "Adequate", "Poor", "Extremely Poor"],
          required: true,
        },
        {
          questionId: "q2",
          text: "Which digital health services should receive primary government subsidy?",
          type: "multi_choice",
          options: [
            "Free 24/7 video consultations with registered medical specialists",
            "Free doorstep delivery of chronic disease medications for seniors",
            "Mobile diagnostic vans visiting rural centers weekly",
            "Electronic health record linkage with instant prescription alerts",
          ],
          required: true,
        },
        {
          questionId: "q3",
          text: "What are the most urgent health challenges your family faces when accessing public healthcare facilities?",
          type: "text",
          required: false,
        },
      ],
      mockResponses: [
        {
          answers: [
            { questionId: "q1", value: "Poor" },
            {
              questionId: "q2",
              value: [
                "Free 24/7 video consultations with registered medical specialists",
                "Mobile diagnostic vans visiting rural centers weekly",
              ],
            },
            {
              questionId: "q3",
              value:
                "Visiting specialists in district hospitals requires a 4-hour bus journey and day-long queues. Telemedicine in local clinics will save lives.",
            },
          ],
        },
        {
          answers: [
            { questionId: "q1", value: "Adequate" },
            {
              questionId: "q2",
              value: [
                "Free doorstep delivery of chronic disease medications for seniors",
                "Electronic health record linkage with instant prescription alerts",
              ],
            },
            {
              questionId: "q3",
              value:
                "Medicine stockouts in public dispensaries force us to buy from private shops at 3x prices. Maintain reliable generic supplies.",
            },
          ],
        },
      ],
    },
  ];

  console.log(`Seeding ${consultationsToSeed.length} consultations...`);

  for (const item of consultationsToSeed) {
    const existing = await Consultation.findOne({ title: item.title });
    let consultationDoc = existing;

    if (!existing) {
      consultationDoc = await Consultation.create({
        title: item.title,
        category: item.category,
        description: item.description,
        status: item.status,
        createdBy: item.createdBy,
        questions: item.questions,
      });
      console.log(`- Created consultation: "${item.title}" [ID: ${consultationDoc._id}]`);
    } else {
      console.log(`- Consultation already exists: "${item.title}" [ID: ${consultationDoc._id}]`);
    }

    // Seed responses if none exist
    const respCount = await Response.countDocuments({ consultationId: consultationDoc._id });
    if (respCount === 0 && item.mockResponses) {
      for (const r of item.mockResponses) {
        await Response.create({
          consultationId: consultationDoc._id,
          citizenId: null,
          answers: r.answers,
        });
      }
      console.log(`  -> Added ${item.mockResponses.length} sample responses`);
    }
  }

  console.log("\nSeeding finished successfully!");
  process.exit(0);
}

seedData().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
