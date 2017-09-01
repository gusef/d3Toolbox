require(Biobase)
require(RColorBrewer)
require(d3Toolbox)
require(gplots)

ui <- fillPage(fillRow(
  d3CollectionOutput("heatmap", width = "100%", height = "100%"),
  fillCol(
    h3(verbatimTextOutput("currentOutput")),
    plotOutput("gplots_heatmap", width = "100%", height = "100%")
  ),flex = c(2,1))
  ,tags$head(tags$script(src="d3-toolbox.js"))
  ,tags$head(tags$script(src="d3Collection.js"))
)

server <- function(input, output, session) {

    output$heatmap <- renderd3Collection({
        
        colors <- c('#1f78b4','#b2df8a','#33a02c','#fb9a99','#fdbf6f',
                    '#ff7f00','#cab2d6','#6a3d9a','#ffff99')
                    
        x <- t(mtcars[,1:9])
        columns <- t(mtcars[10:11])
        colCols <- matrix(colors[columns],ncol=ncol(columns))
        rownames(colCols) <- rownames(columns)
        
        leg <- list(list(colors = colors[unique(columns[1,])],
                         text = unique(columns[1,]),
                         title = rownames(columns)[1]),
                    list(colors = colors[unique(columns[2,])],
                         text = unique(columns[2,]),
                         title = rownames(columns)[2]))
        heatmap.d3(x,
                  scale='row',
                  ColSideColors = colCols,
                  legend = leg,
                  margins = c(150,20,20,80),
                  main = 'heatmap.d3')
    })

    output$gplots_heatmap <- renderPlot({
        colors <- c('#1f78b4','#b2df8a','#33a02c','#fb9a99','#fdbf6f',
                    '#ff7f00','#cab2d6','#6a3d9a','#ffff99')
        
        x <- t(mtcars[,1:9])
        columns <- t(mtcars[10:11])
        colCols <- matrix(colors[columns],ncol=ncol(columns))
        rownames(colCols) <- rownames(columns)
        
        leg <- list(list(colors = colors[unique(columns[1,])],
                         text = unique(columns[1,]),
                         title = rownames(columns)[1]),
                    list(colors = colors[unique(columns[2,])],
                         text = unique(columns[2,]),
                         title = rownames(columns)[2]))

        heatmap.2(x = x,
                  scale='row',
                  col = RColorBrewer::brewer.pal(11,"RdBu")[11:1],
                  ColSideColors = colCols[1,],
                  trace = 'none',
                  main= 'gplots heatmap.2')
    })
    output$currentOutput <- renderPrint({ print(input$heatmap_callback) })
}

shinyApp(ui, server)
