/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoint for Gemini fuel & vehicle health analysis
  app.post("/api/analyze", async (req, res) => {
    try {
      const { vehicle, logs, userQuery } = req.body;

      if (!vehicle) {
        return res.status(400).json({
          success: false,
          error: "Vehicle information is required."
        });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          success: false,
          error: "Gemini API key not found. Please add GEMINI_API_KEY to Settings > Secrets to unlock AI diagnostics."
        });
      }

      // Pre-calculate fuel metrics on the server to help Gemini make higher-quality assessments
      let calculatedMetricsText = "";
      if (logs && logs.length > 1) {
        const sortedLogs = [...logs].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const totalDistance = sortedLogs[sortedLogs.length - 1].odometer - sortedLogs[0].odometer;
        const totalFuel = sortedLogs.slice(1).reduce((sum: number, log: any) => sum + parseFloat(log.liters || 0), 0);
        const avgConsumption = totalDistance > 0 ? (totalFuel / totalDistance) * 100 : 0;
        calculatedMetricsText = `Total distance from first to last fuel log: ${totalDistance} km\nTotal fuel used (excluding initial fillup): ${totalFuel.toFixed(1)} Liters\nAverage fuel consumption computed: ${avgConsumption.toFixed(2)} L/100km`;
      }

      // Format logs for Gemini input
      const formattedLogs = (logs || []).map((log: any, idx: number) => {
        return `Fueling ${idx + 1}: Date: ${log.date} | Odometer: ${log.odometer} | Amount: ${log.liters} L | Cost: ${log.cost} | Fuel Type: ${log.fuelType} ${log.notes ? `| User note: ${log.notes}` : ''}`;
      }).join("\n");

      const systemPrompt = `You are a highly experienced, professional automotive diagnostic engineer. Your job is to analyze refueling and vehicle mileage logs to generate a comprehensive, friendly, and precise vehicle health and diagnostics report in English.
        
Your report must contain the following structured sections using a modern, high-tech, and encouraging tone. Utilize Markdown elements (bullet points, bold text, and relevant emojis like 🚗⚡🔧📊) heavily for optimal reading on mobile screens:

1. **Fuel Economy & Consumption Analysis**: Analyze the vehicle's calculated average fuel consumption in L/100km. Compare it with the standard performance expected for this make/model and manufacturing year. Comment on the performance differences based on fuel types (e.g., regular vs premium) if applicable.
2. **Ignition & Component Health Diagnostic**: What are the potential reasons for changes in fuel consumption? At the vehicle's current mileage, what specific mechanical parts require checkups? (e.g., spark plugs, fuel filter, oxygen sensor, catalytic converter, tire pressure).
3. **Actionable Eco-Driving & Maintenance Tips**: Step-by-step custom actionable suggestions to optimize the combustion cycle, clean fuel residues, and increase fuel economy.
4. **Direct Answers to User Specific Query**: If the user raised any concerns, symptom descriptions, or specific questions, provide authoritative technical troubleshooting advice and recommendations.

All output must be in English. Keep sentences clear, concise, and highly legible.`;

      const prompt = `User Vehicle Profile:
Make/Brand: ${vehicle.brand}
Model: ${vehicle.model}
Model Year: ${vehicle.year}
Fuel Tank Capacity: ${vehicle.fuelCapacity} Liters
Current Odometer Reading: ${vehicle.currentOdometer} km

System Calculated Metrics:
${calculatedMetricsText || 'Insufficient fueling logs data to pre-compute consumption averages yet.'}

Recent Refuel History Logs:
${formattedLogs || 'No refueling logs recorded yet.'}

${userQuery ? `User Specific Question / Reported Symptom: "${userQuery}"` : ''}

Please generate your specialized technical analysis report in English:`;

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        }
      });

      res.json({
        success: true,
        report: response.text
      });

    } catch (error: any) {
      console.error("Gemini server error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "An AI server error occurred while connecting to the diagnostics service."
      });
    }
  });

  // Serve static assets and handle routing via Vite or express.static
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
