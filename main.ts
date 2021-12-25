import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface TextToSpeechSettings {
	voice: string;
	speed: number; //0.1-10
	pitch: number; //0-2
	language: string;
}

const DEFAULT_SETTINGS: TextToSpeechSettings = {
	voice: "default",
	speed: 1,
	pitch: 1,
	language: "default"
}

export default class TextToSpeech extends Plugin {
	settings: TextToSpeechSettings;

	async onload() {
		window.speechSynthesis.getVoices();
		await this.loadSettings();

		const ribbonIconEl = this.addRibbonIcon('audio-file', 'Read selected text', (evt: MouseEvent) => {
			//@ts-ignore
			this.app.commands.executeCommandById('text-to-speech-plugin:read-selected-text');
		});
		
		this.addCommand({
			id: 'read-selected-text',
			name: 'Read Text',
			hotkeys: [{
				modifiers: ["Ctrl"],
				key: "l"
			}],
			callback: () => {
				let selectedText: string = window.getSelection().toString();
				if(selectedText?.length > 0)
				{
					let utterance = new SpeechSynthesisUtterance(selectedText);
					utterance.pitch = this.settings.pitch;
					utterance.rate = this.settings.speed;
					if(this.settings.voice || this.settings.voice !== "default")
					{
						utterance.voice = window.speechSynthesis.getVoices().find(v => v.name === this.settings.voice);
					}	
					if(this.settings.language || this.settings.language !== "default")
					{
						utterance.lang = this.settings.language;
					}					
					window.speechSynthesis.speak(utterance);
				}				
			}
		});

		this.addSettingTab(new TextToSpeechSettingsTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class TextToSpeechSettingsTab extends PluginSettingTab {
	plugin: TextToSpeech;

	constructor(app: App, plugin: TextToSpeech) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Text-to-Speech Settings'});

		new Setting(containerEl)
		.setName('Language')
		.addDropdown(dropdown => 
		{
			dropdown.addOption("default", "default");
			this.languages.forEach(l=> {
				dropdown.addOption(l.value, l.label);
			});
			dropdown.setValue(this.plugin.settings.language);
			dropdown.onChange(async (value) => {
				this.plugin.settings.language = value;
				await this.plugin.saveSettings();
			})
		});

		new Setting(containerEl)
			.setName('Voice')
			.addDropdown(dropdown => 
			{
				dropdown.addOption("default", "default");
				window.speechSynthesis.getVoices().forEach(v=> {
					dropdown.addOption(v.name, v.name);
				});
				dropdown.setValue(this.plugin.settings.voice);
				dropdown.onChange(async (value) => {
					this.plugin.settings.voice = value;
					await this.plugin.saveSettings();
				})
			});

		new Setting(containerEl)
		.setName('Voice Pitch')
		.addSlider(slider => slider.setLimits(0.1,2, 0.1)
		.setValue(this.plugin.settings.pitch)
		.onChange(async (value) => {
			this.plugin.settings.pitch = value;
			await this.plugin.saveSettings();
		}));

		new Setting(containerEl)
		.setName('Reading Speed')
		.addSlider(slider => slider.setLimits(0.1,3, 0.1)
		.setValue(this.plugin.settings.speed)
		.onChange(async (value) => {
			this.plugin.settings.speed = value;
			await this.plugin.saveSettings();
		}));

		
	}

	languages: any[] = [
		{ value: "ar-SA", label: "Arabic Saudi Arabia"},
		{ value: "cs-CZ", label: "Czech Czech Republic"},
		{ value: "da-DK", label: "Danish Denmark"},
		{ value: "de-DE", label: "German Germany"},
		{ value: "el-GR", label: "Modern Greek Greece"},
		{ value: "en-AU", label: "English Australia"},
		{ value: "en-GB", label: "English United Kingdom"},
		{ value: "en-IE", label: "English Ireland"},
		{ value: "en-US", label: "English United States"},
		{ value: "en-ZA", label: "English South Africa"},
		{ value: "es-ES", label: "Spanish Spain"},
		{ value: "es-MX", label: "Spanish Mexico"},
		{ value: "fi-FI", label: "Finnish Finland"},
		{ value: "fr-CA", label: "French Canada"},
		{ value: "fr-FR", label: "French France"},
		{ value: "he-IL", label: "Hebrew Israel"},
		{ value: "hi-IN", label: "Hindi India"},
		{ value: "hu-HU", label: "Hungarian Hungary"},
		{ value: "id-ID", label: "Indonesian Indonesia"},
		{ value: "it-IT", label: "Italian Italy"},
		{ value: "ja-JP", label: "Japanese Japan"},
		{ value: "ko-KR", label: "Korean Republic of Korea"},
		{ value: "nl-BE", label: "Dutch Belgium"},
		{ value: "nl-NL", label: "Dutch Netherlands"},
		{ value: "no-NO", label: "Norwegian Norway"},
		{ value: "pl-PL", label: "Polish Poland"},
		{ value: "pt-BR", label: "Portuguese Brazil"},
		{ value: "pt-PT", label: "Portuguese Portugal"},
		{ value: "ro-RO", label: "Romanian Romania"},
		{ value: "ru-RU", label: "Russian Russian Federation"},
		{ value: "sk-SK", label: "Slovak Slovakia"},
		{ value: "sv-SE", label: "Swedish Sweden"},
		{ value: "th-TH", label: "Thai Thailand"},
		{ value: "tr-TR", label: "Turkish Turkey"},
		{ value: "zh-CN", label: "Chinese China"},
		{ value: "zh-HK", label: "Chinese Hong Kong"},
		{ value: "zh-TW ", label: "Chinese Taiwan"}
	]
}
