/** Share only an in-flight read. Never cache a settled authentication result. */
export function createSessionStatusReader(fetchStatus) {
    let pending = null;
    return function readSessionStatus() {
        if (pending) return pending;
        pending = Promise.resolve().then(fetchStatus).finally(() => {
            pending = null;
        });
        return pending;
    };
}
