import { Link } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../hooks/useRedux'
import { logout } from '../store/authSlice'
import './Navbar.scss'
import { NotificationBell } from './NotificationBell'

export const Navbar = () => {
  const dispatch = useAppDispatch()
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <nav className='navbar'>
      <div className='navbar-container'>
        <Link to='/' className='navbar-logo'>
          iKnow
        </Link>

        <div className='navbar-links'>
          <Link to='/' className='navbar-link'>
            Home
          </Link>
          <Link to='/group' className='navbar-link'>
            Groups
          </Link>

          {isAuthenticated && (
            <>
              <Link to='/my-requests' className='navbar-link'>
                My Requests
              </Link>
              <Link to='/my-predictions' className='navbar-link'>
                My Predictions
              </Link>
              <Link to='/my-bets' className='navbar-link'>
                My Bets
              </Link>
            </>
          )}
        </div>

        <div className='navbar-actions'>
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <div className='navbar-user'>
                {user?.email ||
                  user?.walletAddress?.slice(0, 6) +
                    '...' +
                    user?.walletAddress?.slice(-4)}
              </div>
              <button onClick={handleLogout} className='navbar-button'>
                Logout
              </button>
            </>
          ) : (
            <Link to='/login' className='navbar-button'>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
