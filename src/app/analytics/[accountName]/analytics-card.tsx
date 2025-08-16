import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { GptAnalytics } from "./data.mock";

interface AnalyticsCardProps {
  gptAnalitics: GptAnalytics | null;
}
export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  gptAnalitics
}) => {
  return (
    <Card className='w-full max-w-5xl'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold flex items-center gap-2'>
          <BarChart className='h-6 w-6' />
          Detailed GPT Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-8'>
        <div>
          <ReactMarkdown remarkPlugins={[remarkGfm]} className='prose'>
          {`**Main Info 📍:** ${gptAnalitics?.Description}  
**Main Audience 👥:** ${gptAnalitics?.MainAudience}  
**Fun Fact 😜:** ${gptAnalitics?.FunFact}  
**Content Style 🖼️:** ${gptAnalitics?.ContentStyle}  
**Conclusion 💡:** ${gptAnalitics?.Conclusion}  
**Strategy for Growth 💡:**  
${gptAnalitics?.MarketingStrategy?.map(item => `📌 ${item}`).join('\n\n')}`}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
