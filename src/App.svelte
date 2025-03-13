<script>
	import { onMount } from 'svelte';
	import Unichar from './components/Unichar.svelte';
	import { Button } from '$lib/components/ui/button';
	import DiffViewer from './components/DiffViewer.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import TextCleaner from './components/TextCleaner.svelte';
	import QuranFontRenderer from './components/QuranFontRenderer.svelte';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';

	import { createStore } from './stores/appStore.js';
	const store = createStore();

	let currentTab = 'text-cleaner';

	const copy_items = {
		رموز: '﷽ﷺﷻ۝۞',
		'رموز (اعتمدت حديثًا)':
			'\uFDFE\uFD4E\uFDFF\uFD40\uFD4F\uFD41\uFD42\uFD43\uFD44\uFD45\uFD47\uFD4D\uFD48\uFD49\uFD4A\uFD4C',
		تنسيق: '﴿﴾,«»,‹›,”“,’‘,•,✽'.split(','),
		تواريخ: [
			Intl.DateTimeFormat('ar-SA', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			}).format(),
			Intl.DateTimeFormat('ar-SA').format(),
			Intl.DateTimeFormat('ar-EG').format().replace(/\//g, '-')
		]
	};

	function copyToClipboard(text) {
		navigator.clipboard.writeText(text);
		showNotification('تم النسخ');
	}

	let notification = '';
	let notificationVisible = false;

	function showNotification(message, duration = 2000) {
		notification = message;
		notificationVisible = true;
		setTimeout(() => (notificationVisible = false), duration);
	}

	onMount(() => {
		document.documentElement.setAttribute('dir', 'rtl');
		document.documentElement.setAttribute('lang', 'ar');
	});
</script>

<div class="container mx-auto p-4 font-sans">
	{#if notificationVisible}
		<div class="fixed top-4 left-4 z-50 rounded-md bg-black px-4 py-2 text-white opacity-90">
			{notification}
		</div>
	{/if}

	<Card class="bg-white shadow-md">
		<CardHeader>
			<CardTitle class="text-center text-2xl">أدوات نصية</CardTitle>
		</CardHeader>
		<CardContent>
			<Tabs value={currentTab} onValueChange={(val) => (currentTab = val)}>
				<TabsList class="mb-4 grid grid-cols-4">
					<TabsTrigger value="text-cleaner">تحسين النص</TabsTrigger>
					<TabsTrigger value="unichar">تحليل الحروف</TabsTrigger>
					<TabsTrigger value="diff-viewer">مقارنة النصوص</TabsTrigger>
					<TabsTrigger value="quran-fonts">خطوط القرآن</TabsTrigger>
				</TabsList>

				<TabsContent value="text-cleaner">
					<TextCleaner {showNotification} />
				</TabsContent>

				<TabsContent value="unichar">
					<Unichar {showNotification} />
				</TabsContent>

				<TabsContent value="diff-viewer">
					<DiffViewer {showNotification} />
				</TabsContent>

				<TabsContent value="quran-fonts">
					<QuranFontRenderer {showNotification} />
				</TabsContent>
			</Tabs>
		</CardContent>
	</Card>

	<Separator class="my-6" />
	<Card class="mt-6">
		<CardHeader>
			<CardTitle>للاقتباس</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				{#each Object.entries(copy_items) as [title, items]}
					<div>
						<h3 class="mb-2 text-lg font-semibold">{title}</h3>
						<div class="flex flex-wrap gap-2">
							{#each Array.isArray(items) ? items : items.split('') as item}
								<Button
									variant="outline"
									size="sm"
									class="min-w-8 rounded-full"
									on:click={() => copyToClipboard(item)}
								>
									{item}
								</Button>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</CardContent>
	</Card>

	<footer class="mt-8 border-t py-4 text-center text-gray-500">
		من مشاريع <a href="https://nuqayah.com" class="text-blue-500 hover:underline">نُقاية</a>
	</footer>
</div>

<style>
	:global(html) {
		font-family: 'Kitab', system-ui, sans-serif;
	}

	:global(body) {
		background-color: #f8f9fa;
	}

	:global(.rtl) {
		direction: rtl;
		text-align: right;
	}
</style>
