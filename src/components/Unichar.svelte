<script>
	import { onMount } from 'svelte';
	import Char from './Char.svelte';
	import { CopyIcon } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';

	export let showNotification;

	let text = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ';
	let currentTab = 'character-analysis';

	function copyCharacter(char) {
		navigator.clipboard.writeText(char).then(() => showNotification('تم نسخ الحرف'));
	}

	function normalizeText() {
		text = text.normalize('NFC');
		showNotification('تم تطبيع النص');
	}

	// onMount(() => {
	// 	// Any initialization code
	// });
</script>

<Tabs value={currentTab} onValueChange={(val) => (currentTab = val)}>
	<TabsList class="mb-4 grid grid-cols-2">
		<TabsTrigger value="character-analysis">تحليل الحروف</TabsTrigger>
		<TabsTrigger value="text-normalizer">تطبيع النص</TabsTrigger>
	</TabsList>

	<TabsContent value="character-analysis">
		<div class="space-y-4">
			<Textarea
				bind:value={text}
				placeholder="أدخل النص لتحليل حروفه..."
				class="min-h-20"
				dir="auto"
			/>

			<ScrollArea class="h-64 rounded-md border p-4">
				<div class="flex flex-wrap gap-2">
					{#each [...text] as char}
						{#if char === ' '}
							<div class="w-4"></div>
						{:else if char === '\n'}
							<div class="w-full"></div>
						{:else}
							<Char {char} onCopy={copyCharacter} />
						{/if}
					{/each}
				</div>
			</ScrollArea>
		</div>
	</TabsContent>

	<TabsContent value="text-normalizer">
		<div class="space-y-4">
			<Textarea bind:value={text} placeholder="أدخل النص لتطبيعه..." class="min-h-32" dir="auto" />

			<div class="flex gap-2">
				<Button variant="default" on:click={normalizeText}>تطبيع النص (NFC)</Button>

				<Button variant="outline" on:click={() => copyCharacter(text)}>
					<CopyIcon class="ml-2 h-4 w-4" />
					نسخ النص
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle class="text-sm">معلومات عن تطبيع النص</CardTitle>
				</CardHeader>
				<CardContent>
					<p class="text-sm">
						تطبيع النص (Normalization) هي عملية تحويل النص إلى شكل قياسي متفق عليه. هذا مفيد عند
						مقارنة النصوص أو تخزينها، حيث يمكن أن تظهر الحروف نفسها بطرق مختلفة في يونيكود.
					</p>
					<p class="mt-2 text-sm">
						الشكل القياسي NFC (Normalization Form C) هو الأكثر استخداماً ويجمع بين التركيب والتحليل.
					</p>
				</CardContent>
			</Card>
		</div>
	</TabsContent>
</Tabs>
