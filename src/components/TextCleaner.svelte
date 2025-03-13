<script>
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Separator } from '$lib/components/ui/separator';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { UndoIcon, SettingsIcon, CopyIcon } from 'lucide-svelte';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
	import {
		Collapsible,
		CollapsibleContent,
		CollapsibleTrigger
	} from '$lib/components/ui/collapsible';

	import replacements from '../utils/replacements.js';

	export let showNotification;

	// State
	let text = '';
	let undoStack = [];
	let replacementOptions = getInitialReplacementOptions();
	let optionsOpen = false;

	function getInitialReplacementOptions() {
		const options = {};
		replacements.forEach((group) =>
			group[1].forEach(
				(repl) =>
					// Use repl[0] (the description) as the key
					(options[repl[0]] = repl[2] !== 0) // Default to enabled if not explicitly disabled
			)
		);
		return options;
	}

	const additionalActions = [
		['تحويل رموز «%» إلى نصّ (في الروابط)', [/(.*)/g, (s) => decodeURI(s).replace(/ /g, '%20')]],
		['حذف كل الحركات', [/[ً-ْ]*/g, '']],
		['وضع مسافات قبل كل فقرة', [/(^|\n)(\S)/g, '$1   $2']],
		['إصلاح نحو (ÕæÊíÉ)', [/(.*)/g, (s) => fixArEncoding(s)]],
		['- ➔ •', [/(^ *|\n *)-/g, '$1•']]
	];

	function fixArEncoding(s) {
		return new TextDecoder('windows-1256').decode(
			new Uint8Array([...s].map((c) => c.charCodeAt(0)))
		);
	}

	function processText() {
		addToUndoStack(text);

		let processedText = text;

		replacements.forEach((group) => {
			group[1].forEach((repl) => {
				if (replacementOptions[repl[0]]) {
					const replacement = repl[1];

					if (Array.isArray(replacement)) {
						if (Array.isArray(replacement[0])) {
							// Handle nested arrays of replacements
							replacement.forEach(([pattern, replace]) => {
								processedText = processedText.replace(pattern, replace);
							});
						} else {
							// Handle direct pattern/replacement
							processedText = processedText.replace(replacement[0], replacement[1]);
						}
					}
				}
			});
		});

		text = processedText;

		copyToClipboard(processedText);
	}

	function applyAction(action) {
		addToUndoStack(text);

		let processedText = text;
		const replacement = action[1];

		if (Array.isArray(replacement)) {
			if (Array.isArray(replacement[0])) {
				replacement.forEach(([pattern, replace]) => {
					processedText = processedText.replace(pattern, replace);
				});
			} else {
				processedText = processedText.replace(replacement[0], replacement[1]);
			}
		}

		text = processedText;

		copyToClipboard(processedText);
	}

	function copyToClipboard(text) {
		navigator.clipboard.writeText(text).then(() => showNotification('تم النسخ'));
	}

	function addToUndoStack(currentText) {
		undoStack.push(currentText);
		undoStack = undoStack.slice(-10);
	}

	function undo() {
		if (undoStack.length > 0) {
			text = undoStack.pop();
			undoStack = undoStack;
		}
	}

	function formatArrow(text) {
		return text.replace(/➔/g, '<span class="arrow">➔</span>');
	}

	// onMount(() => {
	// 	// Any initialization code
	// });
</script>

<div class="space-y-4">
	<Textarea
		bind:value={text}
		placeholder="أدخل النص هنا..."
		class="min-h-32 font-mono text-base"
		dir="auto"
	/>

	<div class="flex flex-wrap gap-2">
		<Button variant="default" class="bg-emerald-500 hover:bg-emerald-600" on:click={processText}>
			تحسين النص
		</Button>

		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline">خيارات أخرى</Button>
			</PopoverTrigger>
			<PopoverContent class="w-60">
				<div class="space-y-2">
					{#each additionalActions as action}
						<Button
							variant="ghost"
							class="w-full justify-start"
							on:click={() => applyAction(action)}
						>
							{@html formatArrow(action[0])}
						</Button>
					{/each}
				</div>
			</PopoverContent>
		</Popover>

		<Button variant="outline" on:click={undo} disabled={undoStack.length === 0}>
			<UndoIcon class="ml-2 h-4 w-4" />
			تراجع
		</Button>

		<Button variant="outline" class="ml-auto" on:click={() => (optionsOpen = !optionsOpen)}>
			<SettingsIcon class="ml-2 h-4 w-4" />
			إعدادات التحسين
		</Button>
	</div>

	<Collapsible open={optionsOpen} onOpenChange={(o) => (optionsOpen = o)}>
		<CollapsibleContent>
			<Card>
				<CardContent class="pt-4">
					{#each replacements as [groupName, replacementGroup]}
						<div class="mb-4">
							<h3 class="mb-2 text-lg font-medium">{groupName}</h3>
							<div class="grid grid-cols-1 gap-2 md:grid-cols-2">
								{#each replacementGroup as replacement}
									<div class="flex items-center space-x-2 space-x-reverse">
										<Checkbox
											id={`option-${replacement[0]}`}
											checked={replacementOptions[replacement[0]]}
											onCheckedChange={(checked) => {
												replacementOptions[replacement[0]] = checked;
												replacementOptions = { ...replacementOptions };
											}}
										/>
										<label for={`option-${replacement[0]}`} class="cursor-pointer text-sm">
											{@html formatArrow(replacement[0])}
										</label>
									</div>
								{/each}
							</div>
							{#if groupName !== replacements[replacements.length - 1][0]}
								<Separator class="my-3" />
							{/if}
						</div>
					{/each}
				</CardContent>
			</Card>
		</CollapsibleContent>
	</Collapsible>
</div>

<style>
	:global(.arrow) {
		transform: scale(-1, 1);
		display: inline-block;
		font-size: 0.6rem;
		color: #666;
	}
</style>
