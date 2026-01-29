/**
 * Markdown 渲染组件
 * 用于渲染 AI 返回的 Markdown 格式内容
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// 注意：代码高亮功能保留，但使用 Tailwind 样式而不是 highlight.js 的 CSS
// 如果需要更丰富的代码高亮，可以取消注释下面这行并安装 highlight.js
// import rehypeHighlight from 'rehype-highlight';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]} // 支持 GitHub Flavored Markdown (表格、删除线等)
        // rehypePlugins={[rehypeHighlight]} // 代码高亮（可选，需要 highlight.js）
        components={{
          // 自定义渲染组件，优化样式
          h1: ({ node, ...props }) => (
            <h1 className="text-xl font-bold mt-4 mb-2 text-gray-900" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-lg font-semibold mt-3 mb-2 text-gray-900" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-base font-semibold mt-2 mb-1 text-gray-900" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-2 text-sm leading-relaxed text-gray-800" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-2 space-y-1 text-sm text-gray-800" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-2 space-y-1 text-sm text-gray-800" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-2 text-sm text-gray-800" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            // 行内代码
            if (inline) {
              return (
                <code 
                  className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono" 
                  {...props}
                >
                  {children}
                </code>
              );
            }
            // 代码块 - 使用 Tailwind 样式，不依赖 highlight.js
            return (
              <code className="block bg-gray-900 text-gray-100 rounded-lg p-3 overflow-x-auto mb-2 text-xs font-mono" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ node, children, ...props }: any) => {
            // pre 标签只作为容器，实际样式在 code 中
            return (
              <pre className="mb-2" {...props}>
                {children}
              </pre>
            );
          },
          blockquote: ({ node, ...props }) => (
            <blockquote 
              className="border-l-4 border-gray-300 pl-3 italic my-2 text-sm text-gray-700" 
              {...props} 
            />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full border-collapse border border-gray-300 text-sm" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-100" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="border-b border-gray-200" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-900" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-gray-300 px-3 py-2 text-gray-800" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a 
              className="text-blue-600 hover:text-blue-800 underline" 
              target="_blank" 
              rel="noopener noreferrer"
              {...props} 
            />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-gray-900" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-gray-800" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-3 border-gray-300" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
