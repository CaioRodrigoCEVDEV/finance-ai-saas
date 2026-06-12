import { useState } from 'react';
import { MessageSquareText, AlertCircle, CheckCircle2 } from 'lucide-react';

import Modal from '../ui/Modal';
import Button from '../ui/Button';
import * as feedbackService from '../../services/feedbackService';

const MAX_LENGTH = 1000;
const MIN_LENGTH = 5;

function FeedbackModal({ isOpen, onClose }) {
  const [message, setMessage] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const charCount = message.length;

  function handleClose() {
    setMessage('');
    setPageUrl('');
    setError('');
    setSending(false);
    onClose();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setToast('');

    const trimmed = message.trim();

    if (trimmed.length < MIN_LENGTH) {
      setError(`Mensagem deve ter no minimo ${MIN_LENGTH} caracteres`);
      return;
    }

    try {
      setSending(true);
      const payload = { message: trimmed };
      if (pageUrl.trim()) {
        payload.pageUrl = pageUrl.trim();
      }
      await feedbackService.createFeedback(payload);
      setMessage('');
      setPageUrl('');
      setToast('Feedback enviado com sucesso. Obrigado!');
      setTimeout(() => {
        setToast('');
        onClose();
      }, 1800);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao enviar feedback. Tente novamente.';
      setError(msg);
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal isOpen={isOpen} title="Enviar feedback" onClose={handleClose}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Conte o que voce encontrou, sentiu falta ou gostaria de melhorar.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              value={message}
              onChange={(e) => {
                if (e.target.value.length <= MAX_LENGTH) {
                  setMessage(e.target.value);
                }
              }}
              rows={5}
              placeholder="Digite seu feedback..."
              maxLength={MAX_LENGTH}
              disabled={sending}
              className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-emerald-400"
            />
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {charCount}/{MAX_LENGTH}
              </span>
              {charCount > 0 && charCount < MIN_LENGTH && (
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  Minimo {MIN_LENGTH} caracteres
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {toast && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>{toast}</span>
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
    </Modal>
  );
}

export default FeedbackModal;
