import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { response } from "./data.mock";

export function AnalyticsCard() {
  return (
    <Card className='w-full max-w-5xl'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold flex items-center gap-2'>
          <BarChart className='h-6 w-6' />
          Detailed Analytics & Competition
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-8'>
        <div>
          <ReactMarkdown remarkPlugins={[remarkGfm]} className='prose'>
            {response.choices[0].message.content}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
