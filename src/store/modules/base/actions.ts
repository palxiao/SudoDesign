/**
 * 异步操作 store.dispatch() 调用
 */

interface Iprops {
    commit: (a: any, b: any) => void,
    state: {}
}

export default {
    hideLoading(props: Iprops, data: Type.Object) {
        setTimeout(() => {
            props.commit('loading', false)
        }, 600);
    },
}
