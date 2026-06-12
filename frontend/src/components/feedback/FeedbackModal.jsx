import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquareText, AlertCircle, X } from 'lucide-react';

import Button from '../ui/Button';
import * as feedbackService from '../../services/feedbackService';
import { useToast } from '../../contexts/ToastContext';

const MAX_LENGTH = 1000;
const MIN_LENGTH = 5;

function FeedbackModal({ isOpen, onClose }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const charCount = message.length;

  const handleClose = useCallback(() => {
    setMessage('');
    setError('');
    setSending(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === 'Escape') handleClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const trimmed = message.trim();

    if (trimmed.length < MIN_LENGTH) {
      setError(`Mensagem deve ter no mínimo ${MIN_LENGTH} caracteres`);
      return;
    }

    try {
      setSending(true);
      await feedbackService.createFeedback({ message: trimmed });
      setMessage('');
      toast.success('Feedback enviado com sucesso. Obrigado!');
      handleClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao enviar feedback. Tente novamente.';
      setError(msg);
    } finally {
      setSending(false);
    }
  }

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm dark:bg-slate-950/60"
      onClick={handleClose}
    >
      <div
        className="w-[94%] max-w-lg rounded-[28px] border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Enviar feedback</h2>
          <Button variant="ghost" size="sm" onClick={handleClose} aria-label="Fechar modal">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3 px-5 py-4">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Conte o que você encontrou, sentiu falta ou gostaria de melhorar.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <textarea
                value={message}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_LENGTH) {
                    setMessage(e.target.value);
                  }
                }}
                rows={4}
                placeholder="Digite seu feedback..."
                maxLength={MAX_LENGTH}
                disabled={sending}
                className="block w-full min-h-[140px] resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-900/30"
              />
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {charCount}/{MAX_LENGTH}
                </span>
                {charCount > 0 && charCount < MIN_LENGTH && (
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                    Mínimo {MIN_LENGTH} caracteres
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={handleClose} type="button" disabled={sending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={sending || message.trim().length < MIN_LENGTH}>
                <MessageSquareText className="h-4 w-4" />
                {sending ? 'Enviando...' : 'Enviar feedback'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default FeedbackModal;
