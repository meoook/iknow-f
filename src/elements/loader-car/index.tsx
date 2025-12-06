import styles from './loader.module.scss'

/**
 * @render react
 * @name LoaderCar component
 * @description Svg loader - animating car
 * @example
 * <LoaderCar />
 */

const LoaderCar = ({ flat = false }) => (
  <div className={flat ? styles.flat : styles.screen}>
    <div className={styles.box}>
      <div className={styles.car}>
        <div className={styles.strike}></div>
        <div className={styles.strike2}></div>
        <div className={styles.strike3}></div>
        <div className={styles.strike4}></div>
        <div className={styles.strike5}></div>
        <div className={styles.spoiler}></div>
        <div className={styles.back}></div>
        <div className={styles.center}></div>
        <div className={styles.center1}></div>
        <div className={styles.front}></div>
        <div className={styles.wheel}></div>
        <div className={styles.wheel2}></div>
      </div>
      <div className={styles.text}>
        <span>Loading</span>
        <span className={styles.dots}>...</span>
      </div>
    </div>
  </div>
)

export default LoaderCar
