type Handler<T> = (data: T) => void

class SimpleEmitter<T> {
	private handlers = new Set<Handler<T>>()

	emit(data: T) {
		this.handlers.forEach((h) => h(data))
	}

	subscribe(handler: Handler<T>) {
		this.handlers.add(handler)
		return () => this.handlers.delete(handler)
	}
}

export const locationEmitter = new SimpleEmitter<any>()
