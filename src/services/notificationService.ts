/**
 * Web Notification Service
 * Gerencia notificações web do navegador
 */

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

const DEFAULT_NOTIFICATION_ICON = '/OIP3.png';

class NotificationService {
  private isSupported: boolean;
  private permission: NotificationPermission;

  constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? (Notification.permission as NotificationPermission) : 'denied';
  }

  /**
   * Solicita permissão ao usuário para mostrar notificações
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Web Notifications não suportadas neste navegador');
      return false;
    }

    this.permission = this.isSupported ? Notification.permission : 'denied';

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificações:', error);
      return false;
    }
  }

  /**
   * Verifica se notificações estão habilitadas
   */
  isEnabled(): boolean {
    return this.isSupported && this.permission === 'granted';
  }

  /**
   * Mostra uma notificação
   */
  notify(options: NotificationOptions): Notification | null {
    if (!this.isEnabled()) {
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || DEFAULT_NOTIFICATION_ICON,
        badge: options.badge || DEFAULT_NOTIFICATION_ICON,
        tag: options.tag || 'default',
        requireInteraction: options.requireInteraction || false,
      });

      // Fechar notificação após 5 segundos
      if (!options.requireInteraction) {
        setTimeout(() => notification.close(), 5000);
      }

      return notification;
    } catch (error) {
      console.error('Erro ao exibir notificação:', error);
      return null;
    }
  }

  /**
   * Notificação para nova mensagem
   */
  notifyNewMessage(senderName: string, subject: string, preview?: string): Notification | null {
    return this.notify({
      title: `📨 Nova mensagem de ${senderName}`,
      body: preview || subject || 'Você recebeu uma nova mensagem',
      icon: DEFAULT_NOTIFICATION_ICON,
      tag: 'message',
      requireInteraction: true,
    });
  }

  /**
   * Notificação para escala
   */
  notifyNewSchedule(title: string, details?: string): Notification | null {
    return this.notify({
      title: `📅 ${title}`,
      body: details || 'Você foi escalado para um novo evento',
      icon: DEFAULT_NOTIFICATION_ICON,
      tag: 'schedule',
      requireInteraction: false,
    });
  }

  /**
   * Notificação para substituição
   */
  notifySubstitution(requesterName: string, details?: string): Notification | null {
    return this.notify({
      title: `🔄 ${requesterName} solicitou uma substituição`,
      body: details || 'Verifique a solicitação de substituição',
      icon: DEFAULT_NOTIFICATION_ICON,
      tag: 'substitution',
      requireInteraction: true,
    });
  }
}

// Exportar singleton
export const notificationService = new NotificationService();
