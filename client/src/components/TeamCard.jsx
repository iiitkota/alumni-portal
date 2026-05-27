import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';

export default function ProfileCard({ name, occupation, image, linkedin, github, email }) {
  return (
    <Card
      sx={{
        width: 320, // Fixed width
        textAlign: "center",
        borderRadius: 4,
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
        transition: "transform 0.3s ease-in-out",
        backgroundColor: "#f5f5f5",
      }}
    >
      <CardMedia
        sx={{
          height: { xs: 250, md: 300 },
          width: "100%",
          position: "relative",
          backgroundSize: "cover",
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
          },
        }}
        image={image}
        title="Profile Image"
      />
      <CardContent sx={{ backgroundColor: "#ffffff", padding: "1rem" }}>
        <Typography
          gutterBottom
          variant="h6"
          component="div"
          sx={{ fontWeight: "600", color: "#333", letterSpacing: "0.5px" }}
        >
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {occupation}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: "center", padding: "0.5rem" }}>
        <IconButton
          size="small"
          sx={{ color: "#0077B5" }}
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
        >
          <LinkedInIcon fontSize="medium" />
        </IconButton>
        {github && (
          <IconButton
            size="small"
            sx={{ color: "#333" }}
            href={github}
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubIcon fontSize="medium" />
          </IconButton>
        )}
        {email && (
          <IconButton
            size="small"
            sx={{ color: "#19194D" }}
            href={`mailto:${email}`}
          >
            <EmailIcon fontSize="medium" />
          </IconButton>
        )}
      </CardActions>
    </Card>
  );
}
