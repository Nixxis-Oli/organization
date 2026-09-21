export interface Toast {
	id: number;
	message: string;
	/** Optional second line, for the detail the message itself should not carry. */
	description?: string;
}

/** Long enough to read two lines without being in the way afterwards. */
const DURATION = 5000;

/**
 * The messages currently on screen, and the timers that retire them.
 *
 * One instance for the application: a toast is a property of the window, not of
 * whichever component happened to raise it, and the component that triggers one
 * is often unmounted moments later - the invite wizard closes as it sends.
 */
class Toaster {
	items = $state<Toast[]>([]);

	#timers = new Map<number, ReturnType<typeof setTimeout>>();
	#nextId = 0;

	show(message: string, description?: string) {
		const id = ++this.#nextId;

		this.items = [...this.items, { id, message, description }];
		this.#arm(id);

		return id;
	}

	dismiss(id: number) {
		this.#clear(id);
		this.items = this.items.filter((item) => item.id !== id);
	}

	/**
	 * Reading a message must not race its timer, so pointing at the stack - or
	 * tabbing into it - holds every countdown until the pointer leaves again.
	 */
	pause() {
		for (const id of [...this.#timers.keys()]) {
			this.#clear(id);
		}
	}

	resume() {
		for (const item of this.items) {
			this.#arm(item.id);
		}
	}

	#arm(id: number) {
		this.#clear(id);
		this.#timers.set(
			id,
			setTimeout(() => this.dismiss(id), DURATION)
		);
	}

	#clear(id: number) {
		const timer = this.#timers.get(id);

		if (timer !== undefined) {
			clearTimeout(timer);
			this.#timers.delete(id);
		}
	}
}

export const toaster = new Toaster();
