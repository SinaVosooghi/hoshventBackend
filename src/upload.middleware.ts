import { Injectable, NestMiddleware } from '@nestjs/common';

import { graphqlUploadExpress } from 'graphql-upload';

@Injectable()
export class UploadMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    // Check if the route is not the excluded route
    if (req.url.startsWith('/multiple')) {
      graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 5 })(
        req,
        res,
        next,
      );
    } else {
      // If the route is excluded, proceed to the next middleware
      next();
    }
  }
}
