import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTicketDetail } from '../services/api/ticket';
import { ApiError } from '../services/api/config';
import { TicketDetailPage } from '../components/TicketDetailPage';
import { NotFoundPage } from './NotFoundPage';
import { useBackOrFallback } from '../hooks/useBackOrFallback';
import { ROUTES } from '../constants/routes';
import type { Ticket } from '../components/TicketsPage';

function mapDetailToTicket(d: {
  ticketId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  engineerName?: string;
  estimatedTime?: string;
}): Ticket {
  return {
    id: d.ticketId,
    title: d.title,
    description: d.description,
    status: d.status as Ticket['status'],
    priority: d.priority as Ticket['priority'],
    createdAt: new Date(d.createdAt),
    updatedAt: new Date(d.updatedAt),
    assignedTo: d.engineerName,
    estimatedTime: d.estimatedTime,
    type: 'question',
    hasImage: false,
  };
}

/**
 * 工单详情路由：根据 :id 拉取详情，404 时展示「工单不存在」；返回使用 useBackOrFallback。
 */
export function TicketDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const onBack = useBackOrFallback(ROUTES.TICKETS);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    getTicketDetail(id)
      .then((res) => {
        if (cancelled) return;
        setTicket(mapDetailToTicket(res));
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.code === 404) {
          setNotFound(true);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <span className="text-gray-500">加载中...</span>
      </div>
    );
  }
  if (notFound || !ticket) {
    return <NotFoundPage message="工单不存在" />;
  }
  return <TicketDetailPage ticket={ticket} onBack={onBack} />;
}
