import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/optivision.models';

export interface ChatMessage {
  id: string;
  sender: 'BOT' | 'USER';
  text: string;
  timestamp: string;
  suggestedProducts?: Product[];
  actionLink?: { label: string; url: string };
}

@Injectable({
  providedIn: 'root'
})
export class OptiAssistantService {

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'BOT',
      text: 'Bonjour ! Je suis OptiAssistant 🕶️, votre conseiller visuel IA. Comment puis-je vous aider aujourd\'hui ? (Trouver des montures, choisir vos verres, réserver un examen de vue ou vérifier une commande).',
      timestamp: 'À l\'instant'
    }
  ]);

  public messages$: Observable<ChatMessage[]> = this.messagesSubject.asObservable();
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  public isOpen$: Observable<boolean> = this.isOpenSubject.asObservable();

  toggleChat(): void {
    this.isOpenSubject.next(!this.isOpenSubject.getValue());
  }

  sendMessage(userText: string): void {
    const current = this.messagesSubject.getValue();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'USER',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.messagesSubject.next([...current, userMsg]);

    // Generate Smart Response after slight delay
    setTimeout(() => {
      this.generateBotResponse(userText);
    }, 600);
  }

  private generateBotResponse(text: string): void {
    const lower = text.toLowerCase();
    let replyText = '';
    let actionLink: { label: string; url: string } | undefined = undefined;

    if (lower.includes('rdv') || lower.includes('rendez-vous') || lower.includes('examen') || lower.includes('boutique')) {
      replyText = 'Je peux vous planifier un Examen de vue ou une séance d\'essayage dans nos boutiques à Tunis Ennasr, La Marsa, Sousse ou Sfax. Nos opticiens vous accueillent du Lundi au Samedi.';
      actionLink = { label: 'Prendre Rendez-vous en Ligne', url: '/rdv' };
    } 
    else if (lower.includes('rond') || lower.includes('femme') || lower.includes('500') || lower.includes('prix')) {
      replyText = 'Voici une sélection personnalisée de nos meilleures montures rondes et minimalistes adaptées à votre morphologie.';
      actionLink = { label: 'Voir les Lunettes de Vue', url: '/lunettes' };
    }
    else if (lower.includes('try-on') || lower.includes('essayer') || lower.includes('virtuel') || lower.includes('caméra')) {
      replyText = 'Notre module d\'essayage virtuel 3D vous permet de tester en direct nos montures via votre webcam ou sur nos mannequins virtuels.';
      actionLink = { label: 'Lancer l\'Essayage 3D', url: '/try-on' };
    }
    else if (lower.includes('ordonnance') || lower.includes('verre') || lower.includes('lumière bleue')) {
      replyText = 'Vous pouvez déposer votre ordonnance au format PDF/Photo ou saisir vos valeurs OD/OG. Notre équipe d\'opticiens diplômés validera votre équipement sous 2h.';
      actionLink = { label: 'Déposer une Ordonnance', url: '/ordonnance' };
    }
    else {
      replyText = 'Absolument ! OptiVision propose un accompagnement personnalisé. Notez que toute décision médicale nécessite la validation de nos opticiens diplômés en magasin.';
      actionLink = { label: 'Explorer le Catalogue', url: '/lunettes' };
    }

    const botMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'BOT',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionLink: actionLink
    };

    const current = this.messagesSubject.getValue();
    this.messagesSubject.next([...current, botMsg]);
  }
}
