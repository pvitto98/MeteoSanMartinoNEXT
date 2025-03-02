import React from 'react';
import styles from './info.module.css';

const InfoPage: React.FC = () => {
    return (
        <div className={styles.infoContainer}>
            <h1 className={styles.header}>Informazioni su <strong>San Martino delle Scale</strong></h1>
            <p className={styles.paragraph}>
                <strong>San Martino delle Scale</strong> è una pittoresca frazione di Monreale, situata nella città metropolitana di Palermo, in Sicilia.
                Con una popolazione di oltre 4.000 abitanti, il borgo è noto per il suo straordinario patrimonio storico e naturale.
                Al centro della località si trova l&rsquo;<strong>Abbazia Benedettina di San Martino delle Scale</strong>, un complesso monumentale che ospita
                l&rsquo;accademia delle belle arti e una scuola di restauro. Grazie al suo paesaggio montuoso e ai boschi circostanti, <strong>San Martino
                    delle Scale</strong> è una destinazione ideale per chi cerca un rifugio dalla calura estiva e un contatto autentico con la natura.
            </p>

            <h2 className={styles.subHeader}>Funzionalità dell&rsquo;<strong>Applicazione Meteo</strong></h2>
            <p className={styles.paragraph}>
                La nostra <strong>applicazione meteo</strong> per <strong>San Martino delle Scale</strong> offre dati precisi e aggiornati sulle condizioni atmosferiche della zona.
                Le principali funzionalità includono:
            </p>
            <ul className={styles.list}>
                <li><strong>Temperatura</strong> attuale e percepita</li>
                <li><strong>Velocità e direzione del vento</strong></li>
                <li><strong>Pressione atmosferica</strong></li>
                <li><strong>Valori delle precipitazioni</strong> e storico mensile</li>
                <li><strong>Indice UV</strong> e radiazione solare</li>
                <li><strong>Qualità dell&rsquo;aria</strong> con valori PM2.5</li>
            </ul>
            <p className={styles.paragraph}>
                L&rsquo;archivio storico permette di analizzare l&rsquo;andamento delle condizioni climatiche nel tempo, fornendo informazioni utili
                per escursionisti, residenti e studiosi del clima locale.
            </p>

            <h2 className={styles.subHeader}>Crediti</h2>
            <p className={styles.paragraph}>
                L&rsquo;<strong>applicazione meteo</strong> è stata sviluppata per offrire un servizio dettagliato per la comunità di <strong>San Martino delle Scale</strong>.
            </p>
            <p className={styles.paragraph}>
                Un ringraziamento speciale a <b>Alessandro Messina</b> per aver fornito la stazione meteorologica dalla quale si attingono i dati
                e a <b>Marco Messina</b> per l&rsquo;aiuto nella fase di analisi dei dati.
            </p>
            <div className={styles.buttonContainer}>
                <a href="https://vittoriopellittieri.com/" target="_blank" className={styles.portfolioButton}>
                    Visita il mio portfolio
                </a>
            </div>
            <div className={styles.buttonContainer}>
                <a href="https://www.paypal.me/PietroPPellittieri" target="_blank" className={styles.donateButton}>
                    Dona con PayPal
                </a>
            </div>
        </div>
    );
};

export default InfoPage;