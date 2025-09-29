import {
  Body,
  Container,
  Heading,
  Html,
  Section,
  Text,
} from "@react-email/components";

interface ConfirmationEmailProps {
  userName: string;
}

export default function ConfirmationEmail({
  userName,
}: ConfirmationEmailProps) {
  return (
    <Html>
      <Body
        style={{
          fontFamily: "'Inter', sans-serif",
          backgroundColor: "#F5F5F5",
          padding: "20px",
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#FFFFFF",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #D4AF37",
          }}
        >
          <Heading
            style={{ color: "#1E3A8A", fontSize: "24px", marginBottom: "20px" }}
          >
            Merci, {userName} !
          </Heading>
          <Text
            style={{ color: "#333333", fontSize: "16px", marginBottom: "20px" }}
          >
            Votre formulaire a été soumis avec succès. Nous vous contacterons
            bientôt pour discuter de votre projet.
          </Text>
          <Section style={{ textAlign: "center" }}></Section>
          <Text
            style={{ color: "#666666", fontSize: "14px", marginTop: "20px" }}
          >
            Pour toute question, contactez-nous à project@essaie.com.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
