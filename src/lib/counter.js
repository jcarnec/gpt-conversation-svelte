function createCounter(count) {
    const subscribers = new Set()

    function subscribe(subscriber) {
        subscribers.add(subscriber)
    }

    function update(updater) {
        set(updater(count))
    }

    function set(value) {
        count = value
        subscribers.forEach(subscriber => subscriber(count))
    }

    return {
        subscribe,
        update,
        set
    }
}

export const counter = createCounter(0)