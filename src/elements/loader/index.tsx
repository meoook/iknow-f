import styles from './loader.module.scss'

/**
 * @render react
 * @name Loader component
 * @description It's a simple svg loader. Size 1em (change fontsize to resize)
 * @example
 * <Loader />
 */

const Loader = () => (
  <div data-testid='loader-circle' className={styles.loader}>
    <svg viewBox='0 0 24 24' height='24' width='24' stroke='currentColor'>
      <circle fill='none' cx='12' cy='12' r='10.5' strokeWidth='3' strokeLinecap='round' strokeDasharray='64' />
      <animate attributeName='stroke-dashoffset' dur='2.5s' from='0' to='128' repeatCount='indefinite' />
    </svg>
  </div>
)

export default Loader
