#!/usr/bin/env perl
#
# E2E Test Syntax Error Fixer
# Fixes mixed quotes and emoji encoding issues
#

use strict;
use warnings;
use File::Find;
use File::Copy;

my $project_root = '/home/edwin/development/ptnextjs';
my $test_dir = "$project_root/tests/e2e";

my $files_processed = 0;
my $files_fixed = 0;
my $total_quote_fixes = 0;
my $total_emoji_fixes = 0;

print "=" x 60 . "\n";
print "E2E Test Syntax Error Fixer\n";
print "=" x 60 . "\n\n";

# Find all .spec.ts files
find(\&process_file, $test_dir);

print "\n" . "=" x 60 . "\n";
print "Summary\n";
print "=" x 60 . "\n";
print "Files processed: $files_processed\n";
print "Files fixed: $files_fixed\n";
print "Total quote fixes: $total_quote_fixes\n";
print "Total emoji replacements: $total_emoji_fixes\n";

sub process_file {
    return unless /\.spec\.ts$/;
    return unless -f $_;

    my $file = $File::Find::name;
    $files_processed++;

    # Read file
    open(my $fh, '<:utf8', $file) or die "Cannot open $file: $!";
    my $content = do { local $/; <$fh> };
    close($fh);

    my $original = $content;
    my $quote_count = 0;
    my $emoji_count = 0;

    # Fix 1: Mixed quotes - `...stuff...' -> `...stuff...`
    while ($content =~ s/`([^`]*?)'/`$1`/g) {
        $quote_count++;
    }

    # Fix 2: Replace emojis
    my %emoji_map = (
        '✅' => '[OK]',
        '✓' => '[OK]',
        '❌' => '[FAIL]',
        '📄' => '[DOC]',
        '👤' => '[USER]',
        '🔍' => '[SEARCH]',
        '🏠' => '[HOME]',
        '⚠️' => '[WARN]',
        '⚠' => '[WARN]',
        '🎯' => '[TARGET]',
        '🔧' => '[CONFIG]',
        '📝' => '[NOTE]',
        '💡' => '[INFO]',
        '🚀' => '[LAUNCH]',
        '🔒' => '[LOCK]',
        '🔑' => '[KEY]',
        '📊' => '[CHART]',
        '🎉' => '[SUCCESS]',
        '🐛' => '[BUG]',
        '⏱️' => '[TIMER]',
        '⏱' => '[TIMER]',
        '🕐' => '[TIME]',
    );

    foreach my $emoji (keys %emoji_map) {
        my $count = () = $content =~ /\Q$emoji\E/g;
        if ($count > 0) {
            $content =~ s/\Q$emoji\E/$emoji_map{$emoji}/g;
            $emoji_count += $count;
        }
    }

    # Write if changes were made
    if ($content ne $original) {
        # Create backup
        copy($file, "$file.bak") or die "Cannot backup $file: $!";

        # Write fixed content
        open($fh, '>:utf8', $file) or die "Cannot write $file: $!";
        print $fh $content;
        close($fh);

        $files_fixed++;
        $total_quote_fixes += $quote_count;
        $total_emoji_fixes += $emoji_count;

        my $rel_path = $file;
        $rel_path =~ s/^\Q$project_root\E\///;

        print "[FIXED] $rel_path\n";
        print "  - Mixed quotes: $quote_count\n" if $quote_count > 0;
        print "  - Emojis: $emoji_count\n" if $emoji_count > 0;
    }
}
