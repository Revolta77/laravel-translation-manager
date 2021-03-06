function unsubscribeListener(subscribers, listener) {
    const index = subscribers.indexOf(listener);
    if (index >= 0) subscribers.splice(index, 1);
}

/**
 * Subscribe listener and get function for unsubscribe
 *
 * @param subscribers {array}    subscribers array
 * @param listener {function}              callback to invoke on notification
 * @return {function(): void}    function which will unsubscribe listener
 */
export function subscribeListener(subscribers, listener) {
    const index = subscribers.indexOf(listener);
    if (index < 0) subscribers.push(listener);
    return () => unsubscribeListener(subscribers, listener);
}

/**
 * Inform listeners and pass parameters
 *
 * @param origSubscribers {array}     subscribers
 * @param params        parameters to pass to listener
 */
export function informListeners(origSubscribers, ...params) {
    const subscribers = Object.assign([], origSubscribers);

    const iMax = subscribers.length;
    let unsubscribe = null;
    for (let i = 0; i < iMax; i++) {
        const subscriber = subscribers[i];
        if (!subscriber) {
            const tmp = 0;
        }
        try {
            subscriber.apply(undefined, params);
        } catch (e) {
            if (!unsubscribe) {
                unsubscribe = [];
            }
            Array.push.call(unsubscribe, subscriber);
            console.error("informListeners() listener error for ", i, subscriber, params, subscribers, e);
        }
    }

    if (unsubscribe) {
        Array.forEach.call(unsubscribe, (subscriber) => unsubscribeListener(origSubscribers, subscriber));
    }
}

/**
 * Create subscriber with subscriptions to N signals
 * 
 * Last argument is the callback function for all subscriptions
 * 
 * Other arguments are targets supporting subscribe(function(){}) method to generate callback and returning function
 * to call to unsubscribe
 */
export class Subscriber {
    constructor() {
        this._unsubscribe = [];
        let iMax = arguments.length - 1;
        let callBack = arguments[iMax];

        let signal = (function () {
            if (this._unsubscribe) {
                callBack();
            }
        }).bind(this);

        for (let i = 0; i < iMax; i++) {
            let target = arguments[i];
            this._unsubscribe.push(target.subscribe(signal));
        }

        this.unsubscribe = this.unsubscribe.bind(this);
    }

    /**
     * Unsubscribe from all subscriptions
     */
    unsubscribe() {
        let tmp = this._unsubscribe;
        this._unsubscribe = null;
        let iMax = tmp.length;
        for (let i = 0; i < iMax; i++) {
            tmp[i]();
        }
    }
}
