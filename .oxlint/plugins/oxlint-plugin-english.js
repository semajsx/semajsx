/**
 * Oxlint JS Plugin to enforce English-only comments
 */

export default {
  name: 'english-only',
  rules: {
    'no-non-english-comments': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Disallow non-English characters in comments',
        },
      },
      create(context) {
        const NON_ASCII_REGEX = /[^\x00-\x7F]/;

        return {
          Program(node) {
            const comments = context.getSourceCode().getAllComments();

            for (const comment of comments) {
              const text = comment.value;
              if (NON_ASCII_REGEX.test(text)) {
                context.report({
                  node: comment,
                  message: 'Comments must be in English (no non-ASCII characters allowed)',
                });
              }
            }
          },
        };
      },
    },
  },
};
