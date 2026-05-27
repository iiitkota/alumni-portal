import { Card, CardContent, Typography, Link, Box } from '@mui/material';

const NewsCard = ({ id, title, content, postedOn }) => {
  return (
    <Card id={id} sx={{ width: {xl: 1200, lg: 1000, md: 800, sm: 600, xs: 350}, boxShadow: 3, borderRadius: 2, transition: "transform 0.3s, box-shadow 0.3s", "&:hover": { transform: "translateY(-5px)", boxShadow: 6 } }}>
      <CardContent>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 2, color: '#19194D' }}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2, color: "#19194D" }} component="div">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Posted on: {postedOn}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
