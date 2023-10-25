import styles from "./Example.module.css";

interface Props {
    text: string;
}

export const ExampleNoRequest = ({ text }: Props) => {
    return (
        <div className={styles.example}>
            <p className={styles.exampleText}>{text}</p>
        </div>
    );
};
