import ModalLogin from "../../modals/login"
import { useModalContext } from "../../services/ModalContext"

export default function LoginButton({ mobile }: { mobile?: boolean }) {
    const { openModal, toggleDrawer } = useModalContext()

    const login = () => {
        openModal(ModalLogin)
        if (mobile) toggleDrawer(false)
    }

    const className = mobile ? 'btn blue w-full' : 'btn blue'
    if (mobile) {
        return (
            <div className='p-4'>
                <button className={className} onClick={login}>
                    Войти
                </button>
            </div>
        )
    }
    return (
        <button className={className} onClick={login}>
            Войти
        </button>
    )
}
