import React, { useState } from "react";

// Static replica of the uploaded AWS diagram.
// Replace src placeholders with actual AWS icon URLs or local paths.

const nodes = {
  cloudfront: { x: 60, y: 40, w: 160, h: 48, label: "Amazon CloudFront", img: "/cloudfront.png" },
  s3_web: { x: 240, y: 40, w: 160, h: 48, label: "Amazon S3 (Web Console)", img: "/s3.png" },

  api_gateway: { x: 60, y: 140, w: 160, h: 48, label: "Amazon API Gateway", img: "/api-gateway.png" },
  lambda_rest: { x: 240, y: 140, w: 160, h: 48, label: "AWS Lambda (REST API)", img: "/lambda.png" },
  cognito: { x: 60, y: 220, w: 160, h: 40, label: "Amazon Cognito", img: "/cognito.png" },
  iam: { x: 240, y: 220, w: 160, h: 40, label: "AWS IAM", img: "/iam.png" },

  s3_load: { x: 60, y: 320, w: 180, h: 48, label: "Amazon S3 (Load Testing)", img: "/s3.png" },
  dynamodb: { x: 260, y: 320, w: 160, h: 48, label: "Amazon DynamoDB", img: "/dynamodb.png" },
  sqs: { x: 60, y: 420, w: 140, h: 44, label: "Amazon SQS", img: "/sqs.png" },
  lambda_load: { x: 220, y: 420, w: 160, h: 44, label: "AWS Lambda (Load Testing)", img: "/lambda.png" },
  vpc: { x: 420, y: 360, w: 160, h: 48, label: "Amazon VPC", img: "/vpc.png" },
  fargate: { x: 420, y: 440, w: 160, h: 48, label: "AWS Fargate", img: "/fargate.png" },
  ecr: { x: 620, y: 360, w: 160, h: 48, label: "Amazon ECR", img: "/ecr.png" },
  cloudwatch: { x: 620, y: 440, w: 160, h: 48, label: "Amazon CloudWatch", img: "/cloudwatch.png" },

  taurus: { x: 420, y: 220, w: 220, h: 56, label: "Taurus Docker Image", img: "/taurus.png" },
  codepipeline: { x: 450, y: 60, w: 160, h: 48, label: "AWS CodePipeline", img: "/codepipline.png" },
  s3_pipeline: { x: 650, y: 60, w: 160, h: 48, label: "Amazon S3 (Pipeline)", img: "/s3.png" },
  codebuild: { x: 650, y: 150, w: 160, h: 48, label: "AWS CodeBuild", img: "/codebuild.png" },
};

// explicit connections to match the image (from -> to)
const edges = [
  ["cloudfront", "s3_web"],
  ["cloudfront", "api_gateway"],
  ["api_gateway", "lambda_rest"],
  ["lambda_rest", "dynamodb"],
  ["lambda_rest", "s3_load"],
  ["api_gateway", "cognito"],
  ["api_gateway", "iam"],

  ["s3_load", "sqs"],
  ["sqs", "lambda_load"],
  ["lambda_load", "dynamodb"],
  ["lambda_load", "vpc"],
  ["vpc", "fargate"],
  ["fargate", "ecr"],
  ["fargate", "cloudwatch"],

  ["taurus", "fargate"],
  ["codepipeline", "s3_pipeline"],
  ["s3_pipeline", "codebuild"],
  ["codebuild", "ecr"],
];

function center(node: any) {
  return { cx: node.x + node.w / 2, cy: node.y + node.h / 2 };
}

export default function AwsStaticReplica() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="relative w-full h-[720px] bg-white border rounded-lg shadow-sm overflow-hidden">
      {/* SVG arrows layer */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
            <path d="M0,0 L10,4 L0,8 z" fill="#4B5563" />
          </marker>
        </defs>

        {edges.map(([fromKey, toKey], i) => {
          const from = center((nodes as any)[fromKey]);
          const to = center((nodes as any)[toKey]);

          // simple straight line with small offset so arrows don't overlap node borders
          const dx = to.cx - from.cx;
          const dy = to.cy - from.cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const padFrom = 20;
          const padTo = 20;
          const ux = dx / dist;
          const uy = dy / dist;
          const x1 = from.cx + ux * padFrom;
          const y1 = from.cy + uy * padFrom;
          const x2 = to.cx - ux * padTo;
          const y2 = to.cy - uy * padTo;

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#4B5563"
              strokeWidth={2}
              markerEnd="url(#arrow)"
            />
          );
        })}
      </svg>

      {/* Groups (dashed boxes) to match image layout */}
      <div
        className="absolute border-dashed border-2 border-gray-300 rounded-md"
        style={{ left: 28, top: 20, width: 400, height: 120 }}
      >
        <div className="absolute -top-3 left-3 bg-white px-2 text-xs text-gray-600">Web Console</div>
      </div>

      <div
        className="absolute border-dashed border-2 border-gray-300 rounded-md"
        style={{ left: 28, top: 120, width: 380, height: 180 }}
      >
        <div className="absolute -top-3 left-3 bg-white px-2 text-xs text-gray-600">REST API</div>
      </div>

      <div
        className="absolute border-dashed border-2 border-gray-300 rounded-md"
        style={{ left: 28, top: 300, width: 380, height: 220 }}
      >
        <div className="absolute -top-3 left-3 bg-white px-2 text-xs text-gray-600">Load Testing Engine</div>
      </div>

      <div
        className="absolute border-dashed border-2 border-gray-300 rounded-md"
        style={{ left: 400, top: 40, width: 440, height: 460 }}
      >
        <div className="absolute -top-3 left-3 bg-white px-2 text-xs text-gray-600">Image Pipeline & Compute</div>
      </div>

      {/* Node components (use <img> placeholders for icons) */}
      {Object.entries(nodes).map(([key, n]: any) => (
        <div
          key={key}
          onClick={() => setSelected(n.label)}
          className="absolute flex items-center gap-3 px-3 py-2 rounded shadow cursor-pointer"
          style={{ left: n.x, top: n.y, width: n.w, height: n.h, background: "white" }}
        >
          <img src={n.img} alt={n.label} style={{ width: 28, height: 28 }} />
          <div className="text-xs font-medium text-gray-800">{n.label}</div>
        </div>
      ))}

      {/* Selected label */}
      {selected && (
        <div className="absolute bottom-4 left-1/4 transform -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded">
          {selected}
        </div>
      )}

      {/* small legend */}
      {/* <div className="absolute right-4 top-4 text-xs text-gray-600 bg-white px-3 py-2 rounded shadow-sm">Click a service to see name</div> */}
    </div>
  );
}
