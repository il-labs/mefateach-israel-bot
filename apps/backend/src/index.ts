import app from './app';
import { logger } from '@mifal-israel/utils';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
