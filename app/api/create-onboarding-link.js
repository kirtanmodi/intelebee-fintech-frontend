// import axios from "axios";

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     console.log("SERVERLESS_API_URL", process.env.SERVERLESS_API_URL);
//     const response = await axios.post(`${process.env.SERVERLESS_API_URL}/create-onboarding-link`);

//     res.status(200).json(response.data);
//   } catch (error) {
//     console.error("API Error:", error);
//     res.status(500).json({
//       error: error.response?.data?.error || "Failed to fetch onboarding link",
//     });
//   }
// }
