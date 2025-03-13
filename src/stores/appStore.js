import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export function createStore() {
	const initialState = {
		recentTexts: [],
		userPreferences: {
			darkMode: false,
			fontSize: 'medium',
			enabledReplacements: {}
		}
	};

	// Create the writable store
	const { subscribe, set, update } = writable(initialState);

	const loadFromStorage = () => {
		if (!browser) return;
		try {
			const storedData = localStorage.getItem('ar-text-tools-data');
			if (storedData) {
				const parsedData = JSON.parse(storedData);
				set(parsedData);
			}
		} catch (err) {
			console.error('Failed to load data from localStorage', err);
		}
	};

	const saveToStorage = (data) => {
		if (!browser) return;
		try {
			localStorage.setItem('ar-text-tools-data', JSON.stringify(data));
		} catch (err) {
			console.error('Failed to save data to localStorage', err);
		}
	};

	const addRecentText = (text) => {
		update((state) => {
			const newState = {
				...state,
				recentTexts: [
					text,
					...state.recentTexts.slice(0, 9) // Keep only the last 10 items
				]
			};
			saveToStorage(newState);
			return newState;
		});
	};

	const updatePreferences = (preferences) => {
		update((state) => {
			const newState = {
				...state,
				userPreferences: {
					...state.userPreferences,
					...preferences
				}
			};
			saveToStorage(newState);
			return newState;
		});
	};

	const clearAll = () => {
		set(initialState);
		localStorage.removeItem('ar-text-tools-data');
	};

	// Initialize by loading from storage
	loadFromStorage();

	return {
		subscribe,
		addRecentText,
		updatePreferences,
		clearAll
	};
}
