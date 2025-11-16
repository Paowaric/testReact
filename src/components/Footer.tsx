interface FooterProps {
    company: string;
    year: number;
}

export default function Footer({company, year}: FooterProps) {
    return (
        <>
            <i>&copy; {company} | {year}</i>
        </>
    )
}