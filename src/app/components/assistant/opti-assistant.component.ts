import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OptiAssistantService, ChatMessage } from '../../services/opti-assistant.service';

@Component({
  selector: 'app-opti-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './opti-assistant.component.html',
  styleUrls: ['./opti-assistant.component.css']
})
export class OptiAssistantComponent implements OnInit {

  messages: ChatMessage[] = [];
  isOpen: boolean = false;
  userInput: string = '';

  quickPrompts = [
    'Je cherche des lunettes rondes pour femme',
    'Prendre un RDV Examen de Vue',
    'Essayer des lunettes en 3D',
    'Trouver un magasin à Tunis'
  ];

  constructor(public assistantService: OptiAssistantService) {}

  ngOnInit(): void {
    this.assistantService.messages$.subscribe(msgs => this.messages = msgs);
    this.assistantService.isOpen$.subscribe(open => this.isOpen = open);
  }

  toggleChat(): void {
    this.assistantService.toggleChat();
  }

  send(): void {
    if (!this.userInput.trim()) return;
    this.assistantService.sendMessage(this.userInput);
    this.userInput = '';
  }

  sendQuick(prompt: string): void {
    this.assistantService.sendMessage(prompt);
  }
}
