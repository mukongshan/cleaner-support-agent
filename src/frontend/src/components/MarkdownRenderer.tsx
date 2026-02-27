import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface ThinkBlockProps {
  content: string;
  renderMarkdownContent: (text: string, isInThink?: boolean) => React.ReactNode;
}

/**
 * Think 片段组件，支持折叠功能
 */
const THINK_MAX_CHARS = 200;

function ThinkBlock({ content, renderMarkdownContent }: ThinkBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 按字数判断是否折叠（不超过 200 字）
  const charCount = content.length;
  const shouldCollapse = charCount > THINK_MAX_CHARS;
  
  // 折叠时只显示前 200 字
  const displayedContent = shouldCollapse && !isExpanded
    ? content.slice(0, THINK_MAX_CHARS)
    : content;
  
  const remainingChars = charCount - THINK_MAX_CHARS;
  
  return (
    <div
      className="my-2 px-3 py-2 rounded-md bg-gray-100 text-gray-600 text-sm border-l-4 border-gray-300"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-semibold text-gray-500">思考过程：</div>
        {shouldCollapse && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                收起
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                展开 ({remainingChars} 字)
              </>
            )}
          </button>
        )}
      </div>
      <div className="markdown-think-content text-gray-600">
        {renderMarkdownContent(displayedContent, true)}
      </div>
      {shouldCollapse && !isExpanded && (
        <div className="mt-2 text-xs text-gray-400 italic">
          ... 还有 {remainingChars} 字内容
        </div>
      )}
    </div>
  );
}

/**
 * Markdown 渲染组件
 * 支持基本的 markdown 语法，并特殊处理 <think> 标签
 */
export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // 分割文本，分离 <think> 标签和普通内容
  const splitByThinkTags = (text: string): Array<{ type: 'think' | 'content'; text: string }> => {
    const parts: Array<{ type: 'think' | 'content'; text: string }> = [];
    const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
    let lastIndex = 0;
    let match;

    while ((match = thinkRegex.exec(text)) !== null) {
      // 添加 think 标签之前的内容
      if (match.index > lastIndex) {
        const beforeThink = text.substring(lastIndex, match.index);
        if (beforeThink.trim()) {
          parts.push({ type: 'content', text: beforeThink });
        }
      }

      // 添加 think 标签内容
      parts.push({ type: 'think', text: match[1] });

      lastIndex = match.index + match[0].length;
    }

    // 添加剩余内容
    if (lastIndex < text.length) {
      const remaining = text.substring(lastIndex);
      if (remaining.trim()) {
        parts.push({ type: 'content', text: remaining });
      }
    }

    // 如果没有 think 标签，返回整个文本作为内容
    if (parts.length === 0) {
      parts.push({ type: 'content', text: text });
    }

    return parts;
  };

  // 渲染 markdown 内容
  const renderMarkdownContent = (text: string, isInThink = false): React.ReactNode => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentParagraph: string[] = [];
    let inCodeBlock = false;
    let codeBlockLanguage = '';
    let codeBlockContent: string[] = [];
    let listItems: string[] = [];
    let inList = false;
    let listType: 'ul' | 'ol' = 'ul';

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const paragraphText = currentParagraph.join('\n').trim();
        if (paragraphText) {
          elements.push(
            <p key={`p-${elements.length}`} className="mb-2 last:mb-0">
              {renderInlineMarkdown(paragraphText, isInThink)}
            </p>
          );
        }
        currentParagraph = [];
      }
    };

    const flushCodeBlock = () => {
      if (codeBlockContent.length > 0) {
        elements.push(
          <pre
            key={`code-${elements.length}`}
            className={`${isInThink ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'} rounded-lg p-3 overflow-x-auto my-2 text-sm`}
          >
            <code className={`language-${codeBlockLanguage}`}>
              {codeBlockContent.join('\n')}
            </code>
          </pre>
        );
        codeBlockContent = [];
        codeBlockLanguage = '';
        inCodeBlock = false;
      }
    };

    const flushList = () => {
      if (listItems.length > 0) {
        const ListTag = listType === 'ol' ? 'ol' : 'ul';
        elements.push(
          <ListTag
            key={`list-${elements.length}`}
            className={`${listType === 'ol' ? 'list-decimal' : 'list-disc'} ml-6 mb-2 space-y-1`}
          >
            {listItems.map((item, idx) => (
              <li key={idx}>{renderInlineMarkdown(item.trim(), isInThink)}</li>
            ))}
          </ListTag>
        );
        listItems = [];
        inList = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 代码块检测
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock();
        } else {
          flushParagraph();
          flushList();
          codeBlockLanguage = line.trim().substring(3).trim();
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // 列表检测
      const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
      if (listMatch) {
        const isOrdered = /^\d+\./.test(listMatch[2]);
        const newListType = isOrdered ? 'ol' : 'ul';

        if (!inList || listType !== newListType) {
          flushParagraph();
          flushList();
          inList = true;
          listType = newListType;
        }

        listItems.push(listMatch[3]);
        continue;
      } else if (inList && line.trim() === '') {
        // 空行结束列表
        flushList();
        continue;
      } else if (inList) {
        flushList();
      }

      // 标题检测
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        flushParagraph();
        flushList();
        const level = headingMatch[1].length;
        const headingContent = renderInlineMarkdown(headingMatch[2], isInThink);
        const headingClassName = `font-bold mb-2 mt-3 first:mt-0 ${
          level === 1 ? 'text-xl' :
          level === 2 ? 'text-lg' :
          level === 3 ? 'text-base' : 'text-sm'
        }`;
        
        // 根据级别渲染不同的标题标签
        if (level === 1) {
          elements.push(<h1 key={`h1-${elements.length}`} className={headingClassName}>{headingContent}</h1>);
        } else if (level === 2) {
          elements.push(<h2 key={`h2-${elements.length}`} className={headingClassName}>{headingContent}</h2>);
        } else if (level === 3) {
          elements.push(<h3 key={`h3-${elements.length}`} className={headingClassName}>{headingContent}</h3>);
        } else if (level === 4) {
          elements.push(<h4 key={`h4-${elements.length}`} className={headingClassName}>{headingContent}</h4>);
        } else if (level === 5) {
          elements.push(<h5 key={`h5-${elements.length}`} className={headingClassName}>{headingContent}</h5>);
        } else {
          elements.push(<h6 key={`h6-${elements.length}`} className={headingClassName}>{headingContent}</h6>);
        }
        continue;
      }

      // 水平线
      if (line.trim().match(/^[-*_]{3,}$/)) {
        flushParagraph();
        flushList();
        elements.push(<hr key={`hr-${elements.length}`} className="my-3 border-gray-300" />);
        continue;
      }

      // 普通段落
      if (line.trim() === '') {
        flushParagraph();
        flushList();
      } else {
        currentParagraph.push(line);
      }
    }

    flushParagraph();
    flushList();
    flushCodeBlock();

    return elements.length > 0 ? <>{elements}</> : <>{text}</>;
  };

  // 渲染行内 markdown（粗体、斜体、代码、链接等）
  const renderInlineMarkdown = (text: string, isInThink = false): React.ReactNode => {
    if (!text) return null;

    // 简单的递归解析
    const parse = (str: string, depth = 0): React.ReactNode[] => {
      if (depth > 10 || !str) return [str]; // 防止无限递归

      const parts: React.ReactNode[] = [];
      let idx = 0;
      let partKey = 0;

      while (idx < str.length) {
        let matched = false;

        // 代码 `code`（优先级最高）
        const codeMatch = str.substring(idx).match(/^`([^`]+)`/);
        if (codeMatch) {
          if (idx > 0) {
            parts.push(<span key={`t-${partKey++}`}>{str.substring(0, idx)}</span>);
          }
          parts.push(
            <code key={`c-${partKey++}`} className={`${isInThink ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'} px-1.5 py-0.5 rounded text-sm font-mono`}>
              {codeMatch[1]}
            </code>
          );
          str = str.substring(idx + codeMatch[0].length);
          idx = 0;
          matched = true;
          continue;
        }

        // 链接 [text](url)
        const linkMatch = str.substring(idx).match(/^\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          if (idx > 0) {
            parts.push(<span key={`t-${partKey++}`}>{str.substring(0, idx)}</span>);
          }
          parts.push(
            <a
              key={`l-${partKey++}`}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className={`${isInThink ? 'text-blue-500 hover:text-blue-700' : 'text-blue-600 hover:text-blue-800'} underline`}
            >
              {linkMatch[1]}
            </a>
          );
          str = str.substring(idx + linkMatch[0].length);
          idx = 0;
          matched = true;
          continue;
        }

        // 粗体 **text** 或 __text__
        const boldMatch = str.substring(idx).match(/^(\*\*|__)([^*_\n]+?)\1/);
        if (boldMatch) {
          if (idx > 0) {
            parts.push(<span key={`t-${partKey++}`}>{str.substring(0, idx)}</span>);
          }
          parts.push(
            <strong key={`b-${partKey++}`} className="font-semibold">
              {parse(boldMatch[2], depth + 1)}
            </strong>
          );
          str = str.substring(idx + boldMatch[0].length);
          idx = 0;
          matched = true;
          continue;
        }

        // 删除线 ~~text~~
        const delMatch = str.substring(idx).match(/^~~([^~\n]+?)~~/);
        if (delMatch) {
          if (idx > 0) {
            parts.push(<span key={`t-${partKey++}`}>{str.substring(0, idx)}</span>);
          }
          parts.push(
            <del key={`d-${partKey++}`} className="line-through">
              {delMatch[1]}
            </del>
          );
          str = str.substring(idx + delMatch[0].length);
          idx = 0;
          matched = true;
          continue;
        }

        // 斜体 *text* 或 _text_（不能是粗体的开始）
        const italicMatch = str.substring(idx).match(/^(?<!\*)\*([^*\n]+?)\*(?!\*)|(?<!_)_([^_\n]+?)_(?!_)/);
        if (italicMatch) {
          if (idx > 0) {
            parts.push(<span key={`t-${partKey++}`}>{str.substring(0, idx)}</span>);
          }
          const content = italicMatch[1] || italicMatch[2];
          parts.push(
            <em key={`i-${partKey++}`} className="italic">
              {content}
            </em>
          );
          str = str.substring(idx + italicMatch[0].length);
          idx = 0;
          matched = true;
          continue;
        }

        if (!matched) {
          idx++;
        }
      }

      // 添加剩余文本
      if (str.length > 0) {
        parts.push(<span key={`t-${partKey++}`}>{str}</span>);
      }

      return parts.length > 0 ? parts : [text];
    };

    const result = parse(text);
    return <>{result}</>;
  };

  // 主渲染逻辑
  const parts = splitByThinkTags(content);

  return (
    <div className={`markdown-content ${className}`}>
      {parts.map((part, index) => {
        if (part.type === 'think') {
          return (
            <ThinkBlock
              key={`think-${index}`}
              content={part.text}
              renderMarkdownContent={renderMarkdownContent}
            />
          );
        } else {
          return (
            <div key={`content-${index}`}>
              {renderMarkdownContent(part.text)}
            </div>
          );
        }
      })}
    </div>
  );
}
